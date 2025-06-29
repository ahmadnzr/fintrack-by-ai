
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { format, parseISO } from 'date-fns';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  filterStartDateISO: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export function IncomeExpenseChart({ transactions, filterStartDateISO }: IncomeExpenseChartProps) {
  const filterStartDate = parseISO(filterStartDateISO);
  
  const processDataForChart = (data: Transaction[]): MonthlyData[] => {
    const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {};

    data.forEach((transaction) => {
      const transactionDate = parseISO(transaction.date);
      // Filter transactions to be on or after the filterStartDate
      if (transactionDate < filterStartDate) return;

      const monthYear = format(transactionDate, 'MMM yy');
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { income: 0, expenses: 0 };
      }
      if (transaction.type === "income") {
        monthlyTotals[monthYear].income += Number(transaction.amount);
      } else {
        monthlyTotals[monthYear].expenses += Number(transaction.amount);
      }
    });
    
    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      // Ensure year is parsed as full year for correct sorting if 'yy' is e.g. '99' vs '00'
      const fullYearA = parseInt(yearA) < 70 ? `20${yearA}` : `19${yearA}`; // simple heuristic for 2-digit years
      const fullYearB = parseInt(yearB) < 70 ? `20${yearB}` : `19${yearB}`;
      const dateA = new Date(`01 ${monthA} ${fullYearA}`);
      const dateB = new Date(`01 ${monthB} ${fullYearB}`);
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
          <CardDescription>No data available for the selected period.</CardDescription>
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
