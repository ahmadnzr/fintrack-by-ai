
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Transaction, Category, TransactionType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const TransactionFormSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  description: z.string().min(1, "Description is required.").max(100, "Description too long."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.string().min(1, "Category is required."),
  type: z.enum(["income", "expense"], { required_error: "Type is required." }),
  attachmentUrl: z.string().url("Invalid URL format.").optional().or(z.literal('')),
  tags: z.string().optional(), // Comma-separated string
});

type TransactionFormValues = z.infer<typeof TransactionFormSchema>;

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onSubmit: (data: TransactionFormValues) => Promise<ActionResponseServer>;
  onCancel: () => void;
  formType: "add" | "edit";
}

interface ActionResponseServer {
  success?: boolean;
  error?: { _form?: string[]; [key: string]: any; } | string;
}


export function TransactionForm({ transaction, categories, onSubmit, onCancel, formType }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const defaultValues: TransactionFormValues = transaction
    ? {
        date: new Date(transaction.date),
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category.name, // Use category name for form
        type: transaction.type,
        attachmentUrl: transaction.attachmentUrl || '',
        tags: transaction.tags?.map(tag => tag.name).join(", ") || '',
      }
    : {
        date: new Date(),
        description: '', // Initialize
        amount: 0, // Initialize (validation will require positive)
        category: '', // Initialize
        type: "expense", 
        attachmentUrl: '',
        tags: '',
      };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues,
  });
  
  const selectedType = form.watch("type");

  const filteredCategories = React.useMemo(() => {
    return categories.filter(cat => cat.type === selectedType || cat.type === 'general');
  }, [categories, selectedType]);

  React.useEffect(() => {
    // Reset category if it's not valid for the new type
    const currentCategoryValue = form.getValues("category");
    if (currentCategoryValue && !filteredCategories.find(cat => cat.name === currentCategoryValue)) {
      form.setValue("category", ""); 
    }
  }, [selectedType, filteredCategories, form]);


  const handleSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    const result = await onSubmit(data);
    setIsSubmitting(false);
    if (result.success) {
      form.reset(); 
    } else if (result.error && typeof result.error !== 'string') {
       Object.keys(result.error).forEach(key => {
        if (key !== '_form') {
          form.setError(key as keyof TransactionFormValues, { message: (result.error as any)[key].join(', ') });
        }
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Groceries, Salary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} 
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)} // Ensure value is number
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("category", ""); 
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={!selectedType || filteredCategories.length === 0}>
                    <SelectValue placeholder={!selectedType ? "Select type first" : (filteredCategories.length === 0 ? "No categories for this type" : "Select a category")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}> 
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachmentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachment URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/receipt.pdf" {...field} />
              </FormControl>
              <FormDescription>Link to a receipt or invoice.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., work, personal, project-alpha" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of tags.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formType === "add" ? "Add Transaction" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
