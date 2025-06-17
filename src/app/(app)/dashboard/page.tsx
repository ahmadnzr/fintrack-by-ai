
import { AppHeader } from "@/components/layout/app-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { getAllTransactions } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const transactions = await getAllTransactions();

  const today = new Date();
  const reportDateISO = today.toISOString();

  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(today.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);
  const filterStartTwelveMonthsISO = twelveMonthsAgo.toISOString();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Dashboard" />
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <SummaryCards transactions={transactions} />
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
    </main>
  );
}
