
"use client";

import * as React from "react";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter, RotateCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction, Category } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { addTransactionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/ui/pagination";

interface TransactionsPageClientProps {
  initialTransactions: Transaction[];
  initialCategories: Category[];
}

const ITEMS_PER_PAGE = 10;

export function TransactionsPageClient({ initialTransactions, initialCategories }: TransactionsPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [categories] = React.useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [currentTab, setCurrentTab] = React.useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleTransactionUpdate = () => {
    router.refresh();
    setCurrentPage(1); 
  };

  React.useEffect(() => {
    setTransactions(initialTransactions);
    setCurrentPage(1); // Reset to first page when initial transactions change
  }, [initialTransactions]);

  const handleSubmitNewTransaction = async (data: any) => {
    const formData = new FormData();
    formData.append('date', data.date.toISOString());
    formData.append('description', data.description);
    formData.append('amount', data.amount.toString());
    formData.append('category', data.category);
    formData.append('type', data.type);
    if (data.attachmentUrl) formData.append('attachmentUrl', data.attachmentUrl);
    if (data.tags) formData.append('tags', data.tags);

    const result = await addTransactionAction(formData);
    if (result.success) {
      toast({ title: "Success", description: "Transaction added successfully." });
      handleTransactionUpdate();
      setIsFormOpen(false);
      return { success: true };
    } else {
      toast({ variant: "destructive", title: "Error", description: (typeof result.error === 'string' ? result.error : result.error?._form?.join(', ')) || "Failed to add transaction." });
      return { success: false, error: result.error };
    }
  };

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (transaction.tags && transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = currentTab === "all" || transaction.type === currentTab;
      const matchesCategoryFilter = filterCategory === "all" || transaction.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategoryFilter;
    });
  }, [transactions, searchTerm, currentTab, filterCategory]);
  
  const uniqueCategories = React.useMemo(() => {
    const catSet = new Set<string>();
    initialTransactions.forEach(t => catSet.add(t.category)); // Use initial to get all possible categories
    return Array.from(catSet).sort();
  }, [initialTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentTab, filterCategory]);


  return (
    <>
      <Tabs defaultValue="all" onValueChange={(value) => setCurrentTab(value as any)} className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap px-4 sm:px-0">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={handleTransactionUpdate} aria-label="Refresh transactions">
                <RotateCw className="h-4 w-4"/>
             </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        </div>
        
        <div className="px-4 sm:px-0">
          <Card className="shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="relative w-full md:flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search by description, category, tags..." 
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by category">
                      <Filter className="h-4 w-4 mr-2 inline-block" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <TabsContent value="all" className="mt-0">
                <TransactionTable transactions={paginatedTransactions} categories={categories} onTransactionUpdate={handleTransactionUpdate} />
              </TabsContent>
              <TabsContent value="income" className="mt-0">
                <TransactionTable transactions={paginatedTransactions} categories={categories} onTransactionUpdate={handleTransactionUpdate} />
              </TabsContent>
              <TabsContent value="expense" className="mt-0">
                <TransactionTable transactions={paginatedTransactions} categories={categories} onTransactionUpdate={handleTransactionUpdate} />
              </TabsContent>
              {filteredTransactions.length > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredTransactions.length}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter the details for your new transaction.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            onSubmit={handleSubmitNewTransaction}
            onCancel={() => setIsFormOpen(false)}
            formType="add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
