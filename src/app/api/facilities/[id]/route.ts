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
    // Get facility
    const facility = await prisma.facility.findUnique({
      where: { id }
    });

    if (!facility) {
      return errorResponse('Facility not found', 404);
    }

    // Transform the data to match API schema
    const transformedFacility = {
      id: facility.id,
      name: facility.name,
      description: facility.description,
      icon: facility.icon,
      createdAt: facility.createdAt.toISOString()
    };

    return successResponse(transformedFacility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return errorResponse(['An error occurred while fetching the facility'], 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to update facilities

  const { id } = params;

  try {
    // Check if facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id }
    });

    if (!existingFacility) {
      return errorResponse('Facility not found', 404);
    }

    const body = await req.json();
    const { name, description, icon } = body;

    // Validate required fields
    if (!name) {
      return errorResponse(['Name is required']);
    }

    if (name.length > 50) {
      return errorResponse(['Name must be 50 characters or less']);
    }

    if (description && description.length > 200) {
      return errorResponse(['Description must be 200 characters or less']);
    }

    if (icon && icon.length > 50) {
      return errorResponse(['Icon must be 50 characters or less']);
    }

    // Check if another facility with the same name exists
    const duplicateFacility = await prisma.facility.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (duplicateFacility) {
      return errorResponse(['A facility with this name already exists']);
    }

    // Update facility
    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name,
        description,
        icon
      }
    });

    // Transform the data to match API schema
    const transformedFacility = {
      id: facility.id,
      name: facility.name,
      description: facility.description,
      icon: facility.icon,
      createdAt: facility.createdAt.toISOString()
    };

    return successResponse(transformedFacility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return errorResponse(['An error occurred while updating the facility'], 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to delete facilities

  const { id } = params;

  try {
    // Check if facility exists
    const facility = await prisma.facility.findUnique({
      where: { id }
    });

    if (!facility) {
      return errorResponse('Facility not found', 404);
    }

    // Check if facility is used in any rooms
    const roomCount = await prisma.roomFacility.count({
      where: {
        facilityId: id
      }
    });

    if (roomCount > 0) {
      return errorResponse(
        'Cannot delete a facility that is used in rooms. Please remove it from all rooms first.',
        400
      );
    }

    // Delete facility
    await prisma.facility.delete({
      where: { id }
    });

    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return errorResponse(['An error occurred while deleting the facility'], 500);
  }
}
