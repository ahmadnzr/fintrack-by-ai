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

  // Get category
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  // Check if category exists and belongs to user
  if (!category || category.userId !== user.id) {
    return errorResponse('Category not found', 404);
  }

  return successResponse(category);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.userId !== user.id) {
      return errorResponse('Category not found', 404);
    }

    // Check if category is custom
    if (!existingCategory.isCustom) {
      return errorResponse('Cannot modify a system category', 400);
    }

    const body = await req.json();
    const { name, type, icon } = body;

    // Validate required fields
    if (!name || !type) {
      return errorResponse(['Name and type are required']);
    }

    // Check if another category with the same name and type exists
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
        type,
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      return errorResponse(['A category with this name and type already exists']);
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        type,
        icon,
      },
    });

    return successResponse(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return errorResponse(['An error occurred while updating the category'], 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if category exists and belongs to user
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.id) {
      return errorResponse('Category not found', 404);
    }

    // Check if category is custom
    if (!category.isCustom) {
      return errorResponse('Cannot delete a system category', 400);
    }

    // Check if category is used in any transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: id,
      },
    });

    if (transactionCount > 0) {
      return errorResponse(
        'Cannot delete a category that is used in transactions. Please reassign transactions first.',
        400
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse(['An error occurred while deleting the category'], 500);
  }
}
