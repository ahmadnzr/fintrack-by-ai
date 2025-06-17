import { AppHeader } from "@/components/layout/app-header";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { getAllTransactions, getAllCategories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link"; // Import Link

// This is a server component, so we need a client component wrapper for stateful parts if any
// For now, the TransactionTable itself will manage its stateful dialogs.

// Client component to wrap stateful parts like search/filter and add new dialog trigger
import { TransactionsPageClient } from "./transactions-page-client";

export default async function TransactionsPage() {
  const transactions = await getAllTransactions();
  const categories = await getAllCategories();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Transactions" />
      <TransactionsPageClient initialTransactions={transactions} initialCategories={categories} />
    </main>
  );
}
