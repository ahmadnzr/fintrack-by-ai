"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import type { Category, TransactionType } from "@/lib/types";
import React from "react";
import { Loader2 } from "lucide-react";

const CategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required.").max(50, "Name too long."),
  type: z.enum(["income", "expense", "general"], { required_error: "Category type is required." }),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormValues) => Promise<ActionResponseServer>;
  onCancel: () => void;
  formType: "add" | "edit";
}

interface ActionResponseServer {
  success?: boolean;
  error?: { _form?: string[]; [key: string]: any; } | string;
}

export function CategoryForm({ category, onSubmit, onCancel, formType }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: Partial<CategoryFormValues> = category
    ? {
        name: category.name,
        type: category.type,
      }
    : { type: "expense" }; // Default to expense

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    const result = await onSubmit(data);
    setIsSubmitting(false);
     if (result.success) {
      form.reset(); // Reset form on success
    } else if (result.error && typeof result.error !== 'string') {
       Object.keys(result.error).forEach(key => {
        if (key !== '_form') {
          form.setError(key as keyof CategoryFormValues, { message: (result.error as any)[key].join(', ') });
        }
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="general">General (Both)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.formState.errors._form && (
            <FormMessage className="text-destructive-foreground bg-destructive p-3 rounded-md">
                {form.formState.errors._form.message}
            </FormMessage>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formType === "add" ? "Add Category" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
