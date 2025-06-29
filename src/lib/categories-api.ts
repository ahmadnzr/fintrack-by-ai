"use client";

import { authenticatedFetch } from './auth-client';
import type { Category } from './types';

export interface CategoriesApiParams {
  type?: 'income' | 'expense' | 'general';
  isCustom?: boolean;
  search?: string;
}

export const CategoriesApi = {
  // Get all categories with optional filters
  async getCategories(params?: CategoriesApiParams): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) {
      searchParams.append('type', params.type);
    }
    
    if (params?.isCustom !== undefined) {
      searchParams.append('isCustom', params.isCustom.toString());
    }
    
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    const url = `/api/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Create a new category
  async createCategory(categoryData: { name: string; type: 'income' | 'expense' | 'general'; icon?: string }): Promise<Category> {
    const response = await authenticatedFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?._form?.[0] || error.error?.message || 'Failed to create category');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Update a category
  async updateCategory(id: string, categoryData: { name: string; type: 'income' | 'expense' | 'general'; icon?: string }): Promise<Category> {
    const response = await authenticatedFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?._form?.[0] || error.error?.message || 'Failed to update category');
    }
    
    const result = await response.json();
    return result.data;
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    const response = await authenticatedFetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete category');
    }
  }
};
