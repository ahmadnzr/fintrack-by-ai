'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addTransaction as dbAddTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  getAllTransactions,
} from './data';
import type { Transaction, Category, FinancialInsightParams, TransactionType } from './types';
import { generateFinancialInsights } from '@/ai/flows/generate-financial-insights';

// Transaction Schemas
const TransactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(['income', 'expense']),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export async function addTransactionAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = TransactionSchema.omit({ id: true }).safeParse({
    ...rawData,
    amount: parseFloat(rawData.amount as string),
    tags: rawData.tags ? (rawData.tags as string).split(',').map(tag => tag.trim()) : []
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await dbAddTransaction(parsed.data as Omit<Transaction, 'id'>);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

export async function updateTransactionAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
   const parsed = TransactionSchema.omit({id: true}).safeParse({ // id is path param, not from form
    ...rawData,
    amount: parseFloat(rawData.amount as string),
    tags: rawData.tags ? (rawData.tags as string).split(',').map(tag => tag.trim()) : []
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await dbUpdateTransaction(id, parsed.data as Partial<Transaction>);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await dbDeleteTransaction(id);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Category Schemas
const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  type: z.enum(['income', 'expense', 'general']),
  // icon is not part of form data directly, might be selected from a list
});


export async function addCategoryAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = CategorySchema.omit({ id: true }).safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await dbAddCategory(parsed.data as Omit<Category, 'id' | 'isCustom'>);
    revalidatePath('/categories');
    revalidatePath('/transactions'); // For category dropdowns
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
   const rawData = Object.fromEntries(formData.entries());
  const parsed = CategorySchema.omit({ id: true }).safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    await dbUpdateCategory(id, parsed.data as Partial<Category>);
    revalidatePath('/categories');
    revalidatePath('/transactions');
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await dbDeleteCategory(id);
    revalidatePath('/categories');
    revalidatePath('/transactions');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// AI Financial Insights Action
export async function generateFinancialInsightsAction(): Promise<{ insights?: string; error?: string }> {
  try {
    const allTransactions = await getAllTransactions();
    const incomeTransactions: FinancialInsightParams['income'] = allTransactions
      .filter(t => t.type === 'income')
      .map(t => ({ date: t.date, description: t.description, amount: t.amount, category: t.category }));
    const expenseTransactions: FinancialInsightParams['expenses'] = allTransactions
      .filter(t => t.type === 'expense')
      .map(t => ({ date: t.date, description: t.description, amount: t.amount, category: t.category }));

    if (incomeTransactions.length === 0 && expenseTransactions.length === 0) {
        return { insights: "No transaction data available to generate insights. Please add some income and expenses." };
    }
    
    const result = await generateFinancialInsights({
      income: incomeTransactions,
      expenses: expenseTransactions,
    });
    return { insights: result.insights };
  } catch (e: any) {
    console.error("Error generating financial insights:", e);
    return { error: "Failed to generate financial insights. " + e.message };
  }
}

export type FormState = {
  message?: string;
  fields?: Record<string, string>;
  issues?: string[];
} | undefined;

export interface ActionResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: {
    _form?: string[];
    [key: string]: any; // For field-specific errors
  } | string; // General error message
}
