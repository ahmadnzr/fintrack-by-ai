"use client";

import { authenticatedFetch } from './auth-client';
import type { Transaction } from './types';

export interface TransactionsApiParams {
  type?: 'income' | 'expense';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionCreateData {
  date: string;
  description: string;
  amount: number;
  category: string; // categoryId
  type: 'income' | 'expense';
  attachmentUrl?: string;
  tags?: string[];
}

export interface TransactionUpdateData extends TransactionCreateData {}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

export const TransactionsApi = {
  // Get transactions with optional filters and pagination
  async getTransactions(params?: TransactionsApiParams): Promise<PaginatedResponse<Transaction>> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) {
      searchParams.append('type', params.type);
    }
    
    if (params?.category) {
      searchParams.append('category', params.category);
    }
    
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const url = `/api/transactions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const result = await response.json();
    return result;
  },

  // Get all transactions without pagination (for compatibility)
  async getAllTransactions(params?: Omit<TransactionsApiParams, 'page' | 'limit'>): Promise<Transaction[]> {
    const response = await this.getTransactions({ ...params, limit: 1000 });
    return response.data;
  },

  // Get a single transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    const response = await authenticatedFetch(`/api/transactions/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Create a new transaction
  async createTransaction(transactionData: TransactionCreateData): Promise<Transaction> {
    const response = await authenticatedFetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?._form?.[0] || error.error?.message || 'Failed to create transaction');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Update a transaction
  async updateTransaction(id: string, transactionData: TransactionUpdateData): Promise<Transaction> {
    const response = await authenticatedFetch(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?._form?.[0] || error.error?.message || 'Failed to update transaction');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Delete a transaction
  async deleteTransaction(id: string): Promise<void> {
    const response = await authenticatedFetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete transaction');
    }
  }
};
