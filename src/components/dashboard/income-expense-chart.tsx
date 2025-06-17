"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { format, getMonth, getYear, parseISO } from 'date-fns';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const processDataForChart = (data: Transaction[]): MonthlyData[] => {
    const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {};

    // Consider transactions from the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // Go back 11 months to include current month
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0,0,0,0);


    data.forEach((transaction) => {
      const transactionDate = parseISO(transaction.date);
      if (transactionDate < twelveMonthsAgo) return;

      const monthYear = format(transactionDate, 'MMM yy');
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { income: 0, expenses: 0 };
      }
      if (transaction.type === "income") {
        monthlyTotals[monthYear].income += transaction.amount;
      } else {
        monthlyTotals[monthYear].expenses += transaction.amount;
      }
    });
    
    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`01 ${monthA} ${yearA}`);
      const dateB = new Date(`01 ${monthB} ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });


    return sortedMonths.map(month => ({
      month,
      income: monthlyTotals[month].income,
      expenses: monthlyTotals[month].expenses,
    }));
  };

  const chartData = processDataForChart(transactions);
  
  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Income vs. Expenses (Last 12 Months)</CardTitle>
          <CardDescription>No data available for the last 12 months.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Please add transactions to see the chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Income vs. Expenses (Last 12 Months)</CardTitle>
        <CardDescription>Comparison of total income and expenses per month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value),
                name.charAt(0).toUpperCase() + name.slice(1) // Capitalize name
              ]}
            />
            <Legend wrapperStyle={{paddingTop: '20px'}} />
            <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
