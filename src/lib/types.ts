
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string for date
  description: string;
  amount: number;
  category: Category; // Full category object from API
  type: TransactionType;
  attachmentUrl?: string;
  tags?: Array<{ id: string; name: string }>; // Tag objects from API
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'general'; // 'general' if category can apply to both
  isCustom: boolean;
  icon?: string; // Changed from React.ElementType to string
}

export type FinancialInsightParams = {
  income: Array<{ date: string; description: string; amount: number; category: string }>;
  expenses: Array<{ date: string; description: string; amount: number; category: string }>;
};
