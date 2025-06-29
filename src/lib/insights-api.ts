"use client";

import { authenticatedFetch } from './auth-client';

export interface FinancialInsight {
  id: string;
  insights: string;
  periodStart: string;
  periodEnd: string;
}

export const InsightsApi = {
  // Generate financial insights
  async generateFinancialInsights(): Promise<FinancialInsight> {
    const response = await authenticatedFetch('/api/insights/financial', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.error || 'Failed to generate financial insights');
    }
    
    const result = await response.json();
    return result.data;
  }
};
