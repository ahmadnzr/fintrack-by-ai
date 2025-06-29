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
  const status = searchParams.get('status') as 'available' | 'booked' | 'maintenance' | null;
  const capacity = searchParams.get('capacity');
  const facilityIds = searchParams.get('facilityIds');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (capacity) {
    where.capacity = {
      gte: parseInt(capacity)
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search
        }
      },
      {
        location: {
          contains: search
        }
      }
    ];
  }

  // Handle facility filtering
  if (facilityIds) {
    const facilityIdArray = facilityIds.split(',').filter(id => id.trim());
    if (facilityIdArray.length > 0) {
      where.facilities = {
        some: {
          facilityId: {
            in: facilityIdArray
          }
        }
      };
    }
  }

  try {
    // Get total count
    const total = await prisma.room.count({ where });

    // Get rooms with pagination
    const rooms = await prisma.room.findMany({
      where,
      include: {
        facilities: {
          include: {
            facility: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform the data to match API schema
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      status: room.status,
      location: room.location,
      facilities: room.facilities.map(rf => rf.facility),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString()
    }));

    return paginatedResponse(transformedRooms, total, page, limit);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return errorResponse(['An error occurred while fetching rooms'], 500);
  }
}

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to create rooms

  try {
    const body = await req.json();
    const { name, description, capacity, location, facilityIds } = body;

    // Validate required fields
    if (!name || !capacity) {
      return errorResponse(['Name and capacity are required']);
    }

    if (capacity < 1 || capacity > 100) {
      return errorResponse(['Capacity must be between 1 and 100']);
    }

    if (name.length > 100) {
      return errorResponse(['Name must be 100 characters or less']);
    }

    if (description && description.length > 500) {
      return errorResponse(['Description must be 500 characters or less']);
    }

    if (location && location.length > 200) {
      return errorResponse(['Location must be 200 characters or less']);
    }

    // Check if room with same name already exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        name
      }
    });

    if (existingRoom) {
      return errorResponse(['A room with this name already exists']);
    }

    // Validate facility IDs if provided
    if (facilityIds && Array.isArray(facilityIds) && facilityIds.length > 0) {
      const existingFacilities = await prisma.facility.findMany({
        where: {
          id: {
            in: facilityIds
          }
        }
      });

      if (existingFacilities.length !== facilityIds.length) {
        return errorResponse(['One or more facility IDs are invalid']);
      }
    }

    // Create room with facilities
    const room = await prisma.room.create({
      data: {
        name,
        description,
        capacity,
        location,
        facilities: facilityIds && Array.isArray(facilityIds) ? {
          create: facilityIds.map((facilityId: string) => ({
            facilityId
          }))
        } : undefined
      },
      include: {
        facilities: {
          include: {
            facility: true
          }
        }
      }
    });

    // Transform the data to match API schema
    const transformedRoom = {
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      status: room.status,
      location: room.location,
      facilities: room.facilities.map(rf => rf.facility),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString()
    };

    return successResponse(transformedRoom, 201);
  } catch (error) {
    console.error('Error creating room:', error);
    return errorResponse(['An error occurred while creating the room'], 500);
  }
}
