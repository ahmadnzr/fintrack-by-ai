import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { paginatedResponse, successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type') as 'income' | 'expense' | null;
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    userId: user.id
  };

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = {
      id: category
    };
  }

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { category: { name: { contains: search } } },
      { tags: { some: { tag: { name: { contains: search } } } } }
    ];
  }

  // Get transactions with pagination
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            isCustom: true,
            icon: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  // Format response
  const formattedTransactions = transactions.map(transaction => ({
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    attachmentUrl: transaction.attachmentUrl,
    tags: transaction.tags.map(t => t.tag)
  }));

  return paginatedResponse(formattedTransactions, total, page, limit);
}

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
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
        userId: user.id
      }
    });

    if (!category) {
      return errorResponse(['Invalid category']);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date(date),
        description,
        amount,
        categoryId,
        type,
        attachmentUrl
      },
      include: {
        category: true
      }
    });

    // Handle tags if provided
    if (tags && tags.length > 0) {
      // Process each tag
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findFirst({
          where: {
            name: tagName,
            userId: user.id
          }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId: user.id
            }
          });
        }

        // Create transaction-tag relationship
        await prisma.transactionTag.create({
          data: {
            transactionId: transaction.id,
            tagId: tag.id
          }
        });
      }
    }

    // Get the complete transaction with tags
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
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
      tags: completeTransaction!.tags.map(t => t.tag)
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return errorResponse(['An error occurred while creating the transaction'], 500);
  }
}
