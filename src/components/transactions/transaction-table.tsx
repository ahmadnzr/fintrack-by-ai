
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Eye, Paperclip, Tags } from "lucide-react";
import type { Transaction, Category } from "@/lib/types";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { TransactionsApi } from "@/lib/transactions-api";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionUpdate: () => void; 
}

export function TransactionTable({ transactions, categories, onTransactionUpdate }: TransactionTableProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = React.useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleViewDetails = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    try {
      await TransactionsApi.deleteTransaction(id);
      toast({ title: "Success", description: "Transaction deleted successfully." });
      onTransactionUpdate();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete transaction." });
    }
  };

  const handleSubmitForm = async (data: {
    date: Date;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    attachmentUrl?: string;
    tags?: string;
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

      if (editingTransaction) {
        await TransactionsApi.updateTransaction(editingTransaction.id, transactionData);
        toast({ title: "Success", description: "Transaction updated successfully." });
      } else {
        await TransactionsApi.createTransaction(transactionData);
        toast({ title: "Success", description: "Transaction added successfully." });
      }

      onTransactionUpdate();
      setIsFormOpen(false);
      setEditingTransaction(null);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save transaction.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No transactions found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                <TableCell className="font-medium max-w-xs truncate">{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category.name}</Badge>
                </TableCell>
                <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.type === "income" ? "default" : "secondary"} 
                         className={transaction.type === 'income' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Transaction actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                           >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingTransaction(null);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? "Update the details of your transaction." : "Enter the details for your new transaction."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            categories={categories}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTransaction(null);
            }}
            formType={editingTransaction ? "edit" : "add"}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!viewingTransaction} onOpenChange={(open) => { if (!open) setViewingTransaction(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="space-y-4 py-4">
              <div><strong>Description:</strong> {viewingTransaction.description}</div>
              <div><strong>Amount:</strong> 
                <span className={viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {viewingTransaction.type === 'income' ? '+' : '-'}{formatCurrency(viewingTransaction.amount)}
                </span>
              </div>
              <div><strong>Date:</strong> {format(new Date(viewingTransaction.date), "PPP")}</div>
              <div><strong>Category:</strong> <Badge variant="outline">{viewingTransaction.category.name}</Badge></div>
              <div><strong>Type:</strong> 
                <Badge variant={viewingTransaction.type === "income" ? "default" : "secondary"}
                       className={viewingTransaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {viewingTransaction.type.charAt(0).toUpperCase() + viewingTransaction.type.slice(1)}
                </Badge>
              </div>
              {viewingTransaction.attachmentUrl && (
                <div><strong>Attachment:</strong> <a href={viewingTransaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><Paperclip className="h-4 w-4" />View Attachment</a></div>
              )}
              {viewingTransaction.tags && viewingTransaction.tags.length > 0 && (
                <div><strong>Tags:</strong> 
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingTransaction.tags.map(tag => <Badge key={tag.id} variant="secondary"><Tags className="mr-1 h-3 w-3"/>{tag.name}</Badge>)}
                  </div>
                </div>
              )}
               <div className="pt-4 flex justify-end">
                 <Button onClick={() => setViewingTransaction(null)}>Close</Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
