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
    // Get room with facilities
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        facilities: {
          include: {
            facility: true
          }
        }
      }
    });

    if (!room) {
      return errorResponse('Room not found', 404);
    }

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

    return successResponse(transformedRoom);
  } catch (error) {
    console.error('Error fetching room:', error);
    return errorResponse(['An error occurred while fetching the room'], 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to update rooms

  const { id } = params;

  try {
    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return errorResponse('Room not found', 404);
    }

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

    // Check if another room with the same name exists
    const duplicateRoom = await prisma.room.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (duplicateRoom) {
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

    // Update room with facilities in a transaction
    const room = await prisma.$transaction(async (tx) => {
      // Delete existing room-facility relationships
      await tx.roomFacility.deleteMany({
        where: { roomId: id }
      });

      // Update room and create new facility relationships
      return await tx.room.update({
        where: { id },
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

    return successResponse(transformedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return errorResponse(['An error occurred while updating the room'], 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to delete rooms

  const { id } = params;

  try {
    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Check if room has any active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        roomId: id,
        status: {
          in: ['pending', 'confirmed']
        }
      }
    });

    if (activeBookings > 0) {
      return errorResponse(
        'Cannot delete a room that has active bookings. Please cancel or complete all bookings first.',
        400
      );
    }

    // Delete room (this will cascade delete room-facility relationships)
    await prisma.room.delete({
      where: { id }
    });

    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting room:', error);
    return errorResponse(['An error occurred while deleting the room'], 500);
  }
}
