import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') as 'pdf' | 'excel';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    // Validate format
    if (!format || !['pdf', 'excel'].includes(format)) {
      return errorResponse('Invalid format. Must be pdf or excel.', 400);
    }

    // Parse dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
      if (isNaN(startDate.getTime())) {
        return errorResponse('Invalid startDate format', 400);
      }
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return errorResponse('Invalid endDate format', 400);
      }
    }

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (startDate) {
      where.date = {
        ...where.date,
        gte: startDate,
      };
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: endDate,
      };
    }

    if (type) {
      where.type = type;
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Format transactions for export
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category.name,
      type: transaction.type,
      tags: transaction.tags.map((t) => t.tag.name).join(', '),
    }));

    // For a real implementation, we would generate PDF or Excel here
    // For this example, we'll just return JSON with a note
    
    // In a real implementation, you would:
    // 1. For PDF: Use a library like PDFKit to generate a PDF
    // 2. For Excel: Use a library like ExcelJS to generate an Excel file
    // 3. Set the appropriate Content-Type header
    // 4. Return the file as a stream or buffer

    // For now, we'll just return JSON
    return NextResponse.json({
      format,
      dateRange: {
        from: startDate?.toISOString() || 'all',
        to: endDate?.toISOString() || 'all',
      },
      type: type || 'all',
      transactions: formattedTransactions,
      note: `In a real implementation, this would return a ${format.toUpperCase()} file for download.`,
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return errorResponse(['An error occurred while exporting transactions'], 500);
  }
}
