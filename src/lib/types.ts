
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string for date
  description: string;
  amount: number;
  category: string; // Category ID or name, depends on final structure, using name for simplicity now
  type: TransactionType;
  attachmentUrl?: string;
  tags?: string[];
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
