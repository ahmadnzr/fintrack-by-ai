
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
  reportDateISO: string;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(190, 70%, 50%)",
  "hsl(300, 70%, 50%)",
  "hsl(60, 70%, 50%)",
];

export function ExpenseCategoryChart({ transactions, reportDateISO }: ExpenseCategoryChartProps) {
  const reportDate = parseISO(reportDateISO);
  const currentMonth = reportDate.getMonth();
  const currentYear = reportDate.getFullYear();

  const processDataForChart = (data: Transaction[]): CategoryData[] => {
    const categoryTotals: { [key: string]: number } = {};
    data
      .filter((t) => {
        const transactionDate = parseISO(t.date);
        return t.type === "expense" && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .forEach((transaction) => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value); // Sort for consistent color assignment
  };

  const chartData = processDataForChart(transactions);
  const monthYearDisplay = format(reportDate, 'MMMM yyyy');

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Expense Categories ({monthYearDisplay})</CardTitle>
          <CardDescription>No expense data available for {monthYearDisplay}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Add expenses to see the category breakdown.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Expense Categories ({monthYearDisplay})</CardTitle>
        <CardDescription>Breakdown of expenses by category for {monthYearDisplay}.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              formatter={(value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)}
            />
            <Legend wrapperStyle={{paddingTop: '20px'}} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
