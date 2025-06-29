import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');

  // Build where clause
  const where: any = {};

  if (search) {
    where.name = {
      contains: search
    };
  }

  try {
    // Get facilities
    const facilities = await prisma.facility.findMany({
      where,
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Transform the data to match API schema
    const transformedFacilities = facilities.map(facility => ({
      id: facility.id,
      name: facility.name,
      description: facility.description,
      icon: facility.icon,
      createdAt: facility.createdAt.toISOString()
    }));

    return successResponse(transformedFacilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return errorResponse(['An error occurred while fetching facilities'], 500);
  }
}

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // TODO: Add admin check when user roles are implemented
  // For now, allow all authenticated users to create facilities

  try {
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

    // Check if facility with same name already exists
    const existingFacility = await prisma.facility.findFirst({
      where: {
        name
      }
    });

    if (existingFacility) {
      return errorResponse(['A facility with this name already exists']);
    }

    // Create facility
    const facility = await prisma.facility.create({
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

    return successResponse(transformedFacility, 201);
  } catch (error) {
    console.error('Error creating facility:', error);
    return errorResponse(['An error occurred while creating the facility'], 500);
  }
}
