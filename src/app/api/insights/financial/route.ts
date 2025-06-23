import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
    // Get transactions for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (transactions.length < 5) {
      return errorResponse('Not enough transaction data to generate insights', 400);
    }

    // Separate income and expenses
    const income = transactions.filter((t) => t.type === 'income');
    const expenses = transactions.filter((t) => t.type === 'expense');

    // Calculate total income and expenses
    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((t) => {
      const categoryName = t.category.name;
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = 0;
      }
      expensesByCategory[categoryName] += Number(t.amount);
    });

    // Sort categories by amount
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Generate insights
    let insights = `Financial Insights (${thirtyDaysAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}):\n\n`;

    // Overall summary
    insights += `Overall Summary:\n`;
    insights += `- Total Income: $${totalIncome.toFixed(2)}\n`;
    insights += `- Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    insights += `- Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}\n\n`;

    // Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    insights += `Savings Rate: ${savingsRate.toFixed(1)}%\n`;
    if (savingsRate < 10) {
      insights += `Your savings rate is low. Consider reducing expenses to increase your savings.\n\n`;
    } else if (savingsRate >= 10 && savingsRate < 20) {
      insights += `Your savings rate is good. Keep it up!\n\n`;
    } else {
      insights += `Your savings rate is excellent! You're on track for financial success.\n\n`;
    }

    // Top expense categories
    insights += `Top Expense Categories:\n`;
    topCategories.forEach(([category, amount]) => {
      const percentage = (amount / totalExpenses) * 100;
      insights += `- ${category}: $${amount.toFixed(2)} (${percentage.toFixed(1)}% of expenses)\n`;
    });
    insights += `\n`;

    // Spending trends
    if (expenses.length > 0) {
      // Group expenses by day
      const expensesByDay: Record<string, number> = {};
      expenses.forEach((t) => {
        const day = t.date.toISOString().split('T')[0];
        if (!expensesByDay[day]) {
          expensesByDay[day] = 0;
        }
        expensesByDay[day] += Number(t.amount);
      });

      // Calculate average daily spending
      const avgDailySpending = totalExpenses / Object.keys(expensesByDay).length;
      insights += `Average Daily Spending: $${avgDailySpending.toFixed(2)}\n\n`;
    }

    // Recommendations
    insights += `Recommendations:\n`;
    if (savingsRate < 20) {
      insights += `- Aim to save at least 20% of your income.\n`;
    }

    if (topCategories.length > 0) {
      const [topCategory, topAmount] = topCategories[0];
      const topPercentage = (topAmount / totalExpenses) * 100;
      if (topPercentage > 30) {
        insights += `- Your spending on ${topCategory} is ${topPercentage.toFixed(
          1
        )}% of your expenses. Consider if there are ways to reduce this.\n`;
      }
    }

    if (totalExpenses > totalIncome) {
      insights += `- You're spending more than you earn. Look for ways to increase income or reduce expenses.\n`;
    }

    // Store insights in the database
    const financialInsight = await prisma.financialInsight.create({
      data: {
        userId: user.id,
        insights,
        periodStart: thirtyDaysAgo,
        periodEnd: new Date(),
      },
    });

    return successResponse({
      insights,
      id: financialInsight.id,
    });
  } catch (error) {
    console.error('Error generating financial insights:', error);
    return errorResponse(['An error occurred while generating financial insights'], 500);
  }
}
