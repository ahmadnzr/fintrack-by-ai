import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status') as 'pending' | 'confirmed' | 'cancelled' | 'completed' | null;
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

  // Build where clause
  const where: any = {};

  // Regular users can only see their own bookings
  // TODO: Add admin check when user roles are implemented
  // For now, users can only see their own bookings
  where.userId = user.id;

  // Admin users can filter by userId (when admin roles are implemented)
  if (userId && userId !== user.id) {
    // TODO: Check if user is admin, if not return forbidden
    // For now, ignore userId filter for non-matching users
  }

  if (status) {
    where.status = status;
  }

  if (roomId) {
    where.roomId = roomId;
  }

  if (startDate) {
    where.startTime = {
      gte: new Date(startDate)
    };
  }

  if (endDate) {
    where.endTime = {
      lte: new Date(endDate)
    };
  }

  try {
    // Get total count
    const total = await prisma.booking.count({ where });

    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            facilities: {
              include: {
                facility: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: [
        { startTime: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform the data to match API schema
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      roomId: booking.roomId,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      purpose: booking.purpose,
      status: booking.status,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        status: booking.room.status,
        location: booking.room.location,
        facilities: booking.room.facilities.map(rf => rf.facility),
        createdAt: booking.room.createdAt.toISOString(),
        updatedAt: booking.room.updatedAt.toISOString()
      },
      user: booking.user,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));

    return paginatedResponse(transformedBookings, total, page, limit);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return errorResponse(['An error occurred while fetching bookings'], 500);
  }
}

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { roomId, startTime, endTime, purpose } = body;

    // Validate required fields
    if (!roomId || !startTime || !endTime || !purpose) {
      return errorResponse(['Room ID, start time, end time, and purpose are required']);
    }

    if (purpose.length > 200) {
      return errorResponse(['Purpose must be 200 characters or less']);
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate dates
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return errorResponse(['Invalid date format']);
    }

    if (startDateTime >= endDateTime) {
      return errorResponse(['Start time must be before end time']);
    }

    if (startDateTime < new Date()) {
      return errorResponse(['Start time cannot be in the past']);
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return errorResponse(['Room not found']);
    }

    if (room.status === 'maintenance') {
      return errorResponse(['Room is under maintenance and cannot be booked']);
    }

    // Check if user already has an active booking
    const activeBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['pending', 'confirmed']
        }
      }
    });

    if (activeBooking) {
      return errorResponse(['You already have an active booking. Please cancel or complete it before making a new booking.']);
    }

    // Check for time conflicts with other bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: {
          in: ['pending', 'confirmed']
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return errorResponse(['The room is already booked for the selected time period']);
    }

    // Create booking and update room status
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          roomId,
          startTime: startDateTime,
          endTime: endDateTime,
          purpose,
          status: 'pending'
        },
        include: {
          room: {
            include: {
              facilities: {
                include: {
                  facility: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      // Update room status to booked
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'booked' }
      });

      return newBooking;
    });

    // Transform the data to match API schema
    const transformedBooking = {
      id: booking.id,
      userId: booking.userId,
      roomId: booking.roomId,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      purpose: booking.purpose,
      status: booking.status,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        status: booking.room.status,
        location: booking.room.location,
        facilities: booking.room.facilities.map(rf => rf.facility),
        createdAt: booking.room.createdAt.toISOString(),
        updatedAt: booking.room.updatedAt.toISOString()
      },
      user: booking.user,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    };

    return successResponse(transformedBooking, 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    return errorResponse(['An error occurred while creating the booking'], 500);
  }
}
