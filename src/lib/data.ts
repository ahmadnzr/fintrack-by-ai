import type { Transaction, Category, TransactionType } from './types';
import { PREDEFINED_CATEGORIES } from './constants';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// In-memory store
let transactionsStore: Transaction[] = [
  { id: uuidv4(), date: new Date(2024, 6, 1).toISOString(), description: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'income' },
  { id: uuidv4(), date: new Date(2024, 6, 5).toISOString(), description: 'Groceries', amount: 150, category: 'Food & Drinks', type: 'expense' },
  { id: uuidv4(), date: new Date(2024, 6, 10).toISOString(), description: 'Client Project A', amount: 750, category: 'Freelance', type: 'income' },
  { id: uuidv4(), date: new Date(2024, 6, 12).toISOString(), description: 'Dinner with friends', amount: 60, category: 'Food & Drinks', type: 'expense' },
  { id: uuidv4(), date: new Date(2024, 6, 15).toISOString(), description: 'Electricity Bill', amount: 80, category: 'Bills & Utilities', type: 'expense' },
  { id: uuidv4(), date: new Date(2024, 5, 1).toISOString(), description: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'income' },
  { id: uuidv4(), date: new Date(2024, 5, 7).toISOString(), description: 'Gas Bill', amount: 40, category: 'Bills & Utilities', type: 'expense' },
];
let categoriesStore: Category[] = [...PREDEFINED_CATEGORIES];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Transaction Functions
export async function getAllTransactions(): Promise<Transaction[]> {
  await delay(100);
  return [...transactionsStore].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  await delay(50);
  return transactionsStore.find(t => t.id === id);
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  await delay(100);
  const newTransaction: Transaction = { ...transactionData, id: uuidv4() };
  transactionsStore.push(newTransaction);
  return newTransaction;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  await delay(100);
  const index = transactionsStore.findIndex(t => t.id === id);
  if (index === -1) return null;
  transactionsStore[index] = { ...transactionsStore[index], ...updates };
  return transactionsStore[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await delay(100);
  const initialLength = transactionsStore.length;
  transactionsStore = transactionsStore.filter(t => t.id !== id);
  return transactionsStore.length < initialLength;
}

// Category Functions
export async function getAllCategories(): Promise<Category[]> {
  // This function is now deprecated in favor of API calls
  // Keeping for backward compatibility, but should use API endpoints
  await delay(50);
  return [...categoriesStore];
}

export async function getCategoriesByType(type: TransactionType | 'general'): Promise<Category[]> {
  await delay(50);
  if (type === 'general') return categoriesStore.filter(c => c.type === 'income' || c.type === 'expense' || c.type === 'general');
  return categoriesStore.filter(c => c.type === type || c.type === 'general');
}

export async function addCategory(categoryData: Omit<Category, 'id' | 'isCustom'>): Promise<Category> {
  await delay(100);
  if (categoriesStore.find(c => c.name.toLowerCase() === categoryData.name.toLowerCase() && c.type === categoryData.type)) {
    throw new Error('Category with this name and type already exists.');
  }
  const newCategory: Category = { ...categoryData, id: uuidv4(), isCustom: true };
  categoriesStore.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  await delay(100);
  const index = categoriesStore.findIndex(c => c.id === id);
  if (index === -1 || !categoriesStore[index].isCustom) return null; // Can only update custom categories
  
  if (updates.name && updates.type) {
     if (categoriesStore.find(c => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase() && c.type === updates.type)) {
      throw new Error('Another category with this name and type already exists.');
    }
  } else if (updates.name) {
    if (categoriesStore.find(c => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase() && c.type === categoriesStore[index].type)) {
      throw new Error('Another category with this name and type already exists.');
    }
  }


  categoriesStore[index] = { ...categoriesStore[index], ...updates };
  return categoriesStore[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  await delay(100);
  const categoryToDelete = categoriesStore.find(c => c.id === id);
  if (!categoryToDelete || !categoryToDelete.isCustom) return false; // Can only delete custom categories

  // Optional: Check if category is in use by transactions before deleting
  // For simplicity, we allow deletion. Consider implications in a real app.

  const initialLength = categoriesStore.length;
  categoriesStore = categoriesStore.filter(c => c.id !== id);
  return categoriesStore.length < initialLength;
}

// This is just a placeholder for uuid. In a real app, you'd install the uuid package.
// For Node.js environment (server actions), you can use crypto.randomUUID()
// For client-side, if you need it, install uuid: npm install uuid @types/uuid
if (typeof window !== 'undefined') {
  // Basic polyfill for crypto.randomUUID for client-side if not available (not robust)
  if (!crypto.randomUUID) {
    // @ts-ignore
    crypto.randomUUID = function randomUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
}
const v4 = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
