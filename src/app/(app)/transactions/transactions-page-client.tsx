
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
import { TransactionsApi } from "@/lib/transactions-api";
import { CategoriesApi } from "@/lib/categories-api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export function TransactionsPageClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [currentTab, setCurrentTab] = React.useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = React.useState(1);

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

  const fetchCategories = async () => {
    try {
      const data = await CategoriesApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleTransactionUpdate = () => {
    fetchTransactions();
    setCurrentPage(1); 
  };

  const handleSubmitNewTransaction = async (data: {
    date: Date;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    attachmentUrl?: string;
    tags?: string; // comma-separated string from form
  }) => {
    try {
      // Find the category ID from the category name
      const selectedCategory = categories.find(cat => cat.name === data.category);
      if (!selectedCategory) {
        throw new Error('Selected category not found');
      }

      const transactionData = {
        date: data.date.toISOString(),
        description: data.description,
        amount: data.amount,
        category: selectedCategory.id, // Use categoryId for API
        type: data.type,
        attachmentUrl: data.attachmentUrl,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined,
      };

      await TransactionsApi.createTransaction(transactionData);
      toast({ title: "Success", description: "Transaction added successfully." });
      handleTransactionUpdate();
      setIsFormOpen(false);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add transaction.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      const categoryName = transaction.category?.name || '';
      const tagNames = transaction.tags?.map(tag => tag.name) || [];
      
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tagNames.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = currentTab === "all" || transaction.type === currentTab;
      const matchesCategoryFilter = filterCategory === "all" || categoryName === filterCategory;
      
      return matchesSearch && matchesType && matchesCategoryFilter;
    });
  }, [transactions, searchTerm, currentTab, filterCategory]);
  
  const uniqueCategories = React.useMemo(() => {
    const catSet = new Set<string>();
    transactions.forEach(t => {
      const categoryName = t.category?.name || '';
      if (categoryName) catSet.add(categoryName);
    });
    return Array.from(catSet).sort();
  }, [transactions]);

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
          <Card className="shadow-lg overflow-hidden">
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
