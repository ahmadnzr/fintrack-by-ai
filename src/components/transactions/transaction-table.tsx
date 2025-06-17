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
import { deleteTransactionAction, addTransactionAction, updateTransactionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionUpdate: () => void; // Callback to re-fetch/re-validate data
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

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };
  
  const handleViewDetails = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTransactionAction(id);
    if (result.success) {
      toast({ title: "Success", description: "Transaction deleted successfully." });
      onTransactionUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Failed to delete transaction." });
    }
  };

  const handleSubmitForm = async (data: any) => { // data type from TransactionFormValues
    const formData = new FormData();
    formData.append('date', data.date.toISOString());
    formData.append('description', data.description);
    formData.append('amount', data.amount.toString());
    formData.append('category', data.category);
    formData.append('type', data.type);
    if (data.attachmentUrl) formData.append('attachmentUrl', data.attachmentUrl);
    if (data.tags) formData.append('tags', data.tags);

    let result;
    if (editingTransaction) {
      result = await updateTransactionAction(editingTransaction.id, formData);
    } else {
      result = await addTransactionAction(formData);
    }

    if (result.success) {
      toast({ title: "Success", description: `Transaction ${editingTransaction ? 'updated' : 'added'} successfully.` });
      onTransactionUpdate();
      setIsFormOpen(false);
      setEditingTransaction(null);
      return { success: true };
    } else {
      toast({ variant: "destructive", title: "Error", description: (typeof result.error === 'string' ? result.error : result.error?._form?.join(', ')) || "Failed to save transaction." });
      return { success: false, error: result.error };
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
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                <TableCell className="font-medium max-w-xs truncate">{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
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
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
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
                              className={buttonVariants({variant: "destructive"})}
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
              <div><strong>Category:</strong> <Badge variant="outline">{viewingTransaction.category}</Badge></div>
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
                    {viewingTransaction.tags.map(tag => <Badge key={tag} variant="secondary"><Tags className="mr-1 h-3 w-3"/>{tag}</Badge>)}
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

// Helper for AlertDialog delete button styling
const buttonVariants = ({ variant }: { variant: "destructive" | "default" }) => {
  if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  return "";
}
