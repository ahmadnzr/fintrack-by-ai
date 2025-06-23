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

  // Get transaction
  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Check if transaction exists and belongs to user
  if (!transaction || transaction.userId !== user.id) {
    return errorResponse('Transaction not found', 404);
  }

  // Format response
  const response = {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    attachmentUrl: transaction.attachmentUrl,
    tags: transaction.tags.map((t) => t.tag),
  };

  return successResponse(response);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== user.id) {
      return errorResponse('Transaction not found', 404);
    }

    const body = await req.json();
    const { date, description, amount, category: categoryId, type, attachmentUrl, tags } = body;

    // Validate required fields
    if (!date || !description || !amount || !categoryId || !type) {
      return errorResponse(['All required fields must be provided']);
    }

    // Validate category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return errorResponse(['Invalid category']);
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        date: new Date(date),
        description,
        amount,
        categoryId,
        type,
        attachmentUrl,
      },
      include: {
        category: true,
      },
    });

    // Handle tags if provided
    if (tags) {
      // Remove existing tags
      await prisma.transactionTag.deleteMany({
        where: { transactionId: id },
      });

      // Add new tags
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Find or create tag
          let tag = await prisma.tag.findFirst({
            where: {
              name: tagName,
              userId: user.id,
            },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
                userId: user.id,
              },
            });
          }

          // Create transaction-tag relationship
          await prisma.transactionTag.create({
            data: {
              transactionId: transaction.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    // Get the complete transaction with tags
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Format response
    const response = {
      id: completeTransaction!.id,
      date: completeTransaction!.date,
      description: completeTransaction!.description,
      amount: completeTransaction!.amount,
      category: completeTransaction!.category,
      type: completeTransaction!.type,
      attachmentUrl: completeTransaction!.attachmentUrl,
      tags: completeTransaction!.tags.map((t) => t.tag),
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return errorResponse(['An error occurred while updating the transaction'], 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = params;

  try {
    // Check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== user.id) {
      return errorResponse('Transaction not found', 404);
    }

    // Delete transaction (this will cascade delete transaction tags)
    await prisma.transaction.delete({
      where: { id },
    });

    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return errorResponse(['An error occurred while deleting the transaction'], 500);
  }
}
