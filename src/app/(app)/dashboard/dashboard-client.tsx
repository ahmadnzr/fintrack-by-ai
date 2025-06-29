"use client";

import * as React from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { TransactionsApi } from "@/lib/transactions-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PlusCircle, RotateCw } from "lucide-react";
import type { Transaction } from "@/lib/types";

export function DashboardClient() {
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await TransactionsApi.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const today = new Date();
  const reportDateISO = today.toISOString();

  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(today.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);
  const filterStartTwelveMonthsISO = twelveMonthsAgo.toISOString();

  if (isLoading) {
    return (
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="shadow-lg col-span-1 lg:col-span-4">
            <CardContent className="p-6">
              <div className="h-64 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
          <Card className="shadow-lg col-span-1 lg:col-span-3">
            <CardContent className="p-6">
              <div className="h-64 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div></div>
        <Button variant="outline" size="icon" onClick={fetchTransactions} aria-label="Refresh dashboard">
          <RotateCw className="h-4 w-4"/>
        </Button>
      </div>
      
      <SummaryCards transactions={transactions} reportDateISO={reportDateISO} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="shadow-lg col-span-1 lg:col-span-4">
          <IncomeExpenseChart transactions={transactions} filterStartDateISO={filterStartTwelveMonthsISO} />
        </Card>
        <Card className="shadow-lg col-span-1 lg:col-span-3">
          <ExpenseCategoryChart transactions={transactions} reportDateISO={reportDateISO} />
        </Card>
      </div>
      
      {transactions.length === 0 && (
        <Card className="mt-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome to Fintrack!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              It looks like you haven't added any transactions yet.
            </p>
            <Button asChild size="lg">
              <Link href="/transactions">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Transaction
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
