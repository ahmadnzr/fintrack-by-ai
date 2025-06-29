import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Get booking with room and user details
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check if user can access this booking
    // TODO: Add admin check when user roles are implemented
    if (booking.userId !== user.id) {
      return errorResponse('Forbidden - Can only access own bookings', 403);
    }

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

    return successResponse(transformedBooking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return errorResponse(['An error occurred while fetching the booking'], 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true
      }
    });

    if (!existingBooking) {
      return errorResponse('Booking not found', 404);
    }

    // Check if user can modify this booking
    // TODO: Add admin check when user roles are implemented
    if (existingBooking.userId !== user.id) {
      return errorResponse('Forbidden - Can only modify own bookings', 403);
    }

    const body = await req.json();
    const { status, startTime, endTime, purpose } = body;

    // Prepare update data
    const updateData: any = {};

    // Handle status updates
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return errorResponse(['Invalid status value']);
      }

      // Only allow certain status transitions
      if (existingBooking.status === 'cancelled' || existingBooking.status === 'completed') {
        return errorResponse(['Cannot modify a cancelled or completed booking']);
      }

      updateData.status = status;
    }

    // Handle time and purpose updates (only if booking is still pending)
    if (startTime || endTime || purpose) {
      if (existingBooking.status !== 'pending') {
        return errorResponse(['Can only modify time and purpose for pending bookings']);
      }

      if (startTime) {
        const startDateTime = new Date(startTime);
        if (isNaN(startDateTime.getTime())) {
          return errorResponse(['Invalid start time format']);
        }
        if (startDateTime < new Date()) {
          return errorResponse(['Start time cannot be in the past']);
        }
        updateData.startTime = startDateTime;
      }

      if (endTime) {
        const endDateTime = new Date(endTime);
        if (isNaN(endDateTime.getTime())) {
          return errorResponse(['Invalid end time format']);
        }
        updateData.endTime = endDateTime;
      }

      if (purpose !== undefined) {
        if (!purpose || purpose.length > 200) {
          return errorResponse(['Purpose is required and must be 200 characters or less']);
        }
        updateData.purpose = purpose;
      }

      // Validate time range if either time is being updated
      if (updateData.startTime || updateData.endTime) {
        const finalStartTime = updateData.startTime || existingBooking.startTime;
        const finalEndTime = updateData.endTime || existingBooking.endTime;

        if (finalStartTime >= finalEndTime) {
          return errorResponse(['Start time must be before end time']);
        }

        // Check for time conflicts with other bookings
        const conflictingBooking = await prisma.booking.findFirst({
          where: {
            roomId: existingBooking.roomId,
            id: { not: id },
            status: {
              in: ['pending', 'confirmed']
            },
            OR: [
              {
                AND: [
                  { startTime: { lte: finalStartTime } },
                  { endTime: { gt: finalStartTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: finalEndTime } },
                  { endTime: { gte: finalEndTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: finalStartTime } },
                  { endTime: { lte: finalEndTime } }
                ]
              }
            ]
          }
        });

        if (conflictingBooking) {
          return errorResponse(['The room is already booked for the selected time period']);
        }
      }
    }

    // Update booking and potentially room status
    const booking = await prisma.$transaction(async (tx) => {
      // Update the booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: updateData,
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

      // Update room status based on booking status
      if (status === 'cancelled' || status === 'completed') {
        // Check if there are other active bookings for this room
        const otherActiveBookings = await tx.booking.count({
          where: {
            roomId: existingBooking.roomId,
            id: { not: id },
            status: {
              in: ['pending', 'confirmed']
            }
          }
        });

        // If no other active bookings, set room status to available
        if (otherActiveBookings === 0) {
          await tx.room.update({
            where: { id: existingBooking.roomId },
            data: { status: 'available' }
          });
        }
      } else if (status === 'confirmed') {
        // Set room status to booked
        await tx.room.update({
          where: { id: existingBooking.roomId },
          data: { status: 'booked' }
        });
      }

      return updatedBooking;
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

    return successResponse(transformedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return errorResponse(['An error occurred while updating the booking'], 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check if user can delete this booking
    // TODO: Add admin check when user roles are implemented
    if (booking.userId !== user.id) {
      return errorResponse('Forbidden - Can only delete own bookings', 403);
    }

    // Only allow deletion of pending or cancelled bookings
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return errorResponse('Cannot delete a confirmed or completed booking. Please cancel it first.', 400);
    }

    // Delete booking and update room status
    await prisma.$transaction(async (tx) => {
      // Delete the booking
      await tx.booking.delete({
        where: { id }
      });

      // Check if there are other active bookings for this room
      const otherActiveBookings = await tx.booking.count({
        where: {
          roomId: booking.roomId,
          status: {
            in: ['pending', 'confirmed']
          }
        }
      });

      // If no other active bookings, set room status to available
      if (otherActiveBookings === 0) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'available' }
        });
      }
    });

    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return errorResponse(['An error occurred while deleting the booking'], 500);
  }
}
