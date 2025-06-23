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
  const type = searchParams.get('type') as 'income' | 'expense' | 'general' | null;
  const isCustom = searchParams.get('isCustom') === 'true' ? true : 
                  searchParams.get('isCustom') === 'false' ? false : null;
  const search = searchParams.get('search');

  // Build where clause
  const where: any = {
    userId: user.id
  };

  if (type) {
    where.type = type;
  }

  if (isCustom !== null) {
    where.isCustom = isCustom;
  }

  if (search) {
    where.name = {
      contains: search
    };
  }

  // Get categories
  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  });

  return successResponse(categories);
}

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { name, type, icon } = body;

    // Validate required fields
    if (!name || !type) {
      return errorResponse(['Name and type are required']);
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
        type
      }
    });

    if (existingCategory) {
      return errorResponse(['A category with this name and type already exists']);
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        type,
        isCustom: true,
        icon
      }
    });

    return successResponse(category, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse(['An error occurred while creating the category'], 500);
  }
}
