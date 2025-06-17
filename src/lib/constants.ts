import type { Category } from './types';
import { Briefcase, Gift, ShoppingCart, Utensils, Car, Receipt, Home, Film, HeartPulse, BookOpen, Tag } from 'lucide-react';

export const PREDEFINED_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'salary', name: 'Salary', type: 'income', isCustom: false, icon: Briefcase },
  { id: 'gifts_income', name: 'Gifts', type: 'income', isCustom: false, icon: Gift },
  { id: 'sales', name: 'Sales', type: 'income', isCustom: false, icon: ShoppingCart },
  { id: 'freelance', name: 'Freelance', type: 'income', isCustom: false, icon: Briefcase },
  { id: 'investments_income', name: 'Investments', type: 'income', isCustom: false, icon: Briefcase },
  
  // Expense Categories
  { id: 'food', name: 'Food & Drinks', type: 'expense', isCustom: false, icon: Utensils },
  { id: 'transportation', name: 'Transportation', type: 'expense', isCustom: false, icon: Car },
  { id: 'bills', name: 'Bills & Utilities', type: 'expense', isCustom: false, icon: Receipt },
  { id: 'housing', name: 'Housing', type: 'expense', isCustom: false, icon: Home },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', isCustom: false, icon: Film },
  { id: 'healthcare', name: 'Healthcare', type: 'expense', isCustom: false, icon: HeartPulse },
  { id: 'education', name: 'Education', type: 'expense', isCustom: false, icon: BookOpen },
  { id: 'shopping', name: 'Shopping', type: 'expense', isCustom: false, icon: ShoppingCart },
  { id: 'other_income', name: 'Other Income', type: 'income', isCustom: false, icon: Tag },
  { id: 'other_expense', name: 'Other Expense', type: 'expense', isCustom: false, icon: Tag },
];

export const APP_NAME = "Fintrack";
