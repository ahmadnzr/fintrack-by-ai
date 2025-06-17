'use server';

/**
 * @fileOverview AI-powered financial insights generator.
 *
 * - generateFinancialInsights - A function that generates financial insights based on user's spending habits.
 * - GenerateFinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - GenerateFinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialInsightsInputSchema = z.object({
  income: z
    .array(z.object({
      date: z.string(),
      description: z.string(),
      amount: z.number(),
      category: z.string(),
    }))
    .describe('Array of income transactions.'),
  expenses: z
    .array(z.object({
      date: z.string(),
      description: z.string(),
      amount: z.number(),
      category: z.string(),
    }))
    .describe('Array of expense transactions.'),
});

export type GenerateFinancialInsightsInput = z.infer<typeof GenerateFinancialInsightsInputSchema>;

const GenerateFinancialInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights on spending habits and potential overspending areas.'),
});

export type GenerateFinancialInsightsOutput = z.infer<typeof GenerateFinancialInsightsOutputSchema>;

export async function generateFinancialInsights(input: GenerateFinancialInsightsInput): Promise<GenerateFinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightsPrompt',
  input: {schema: GenerateFinancialInsightsInputSchema},
  output: {schema: GenerateFinancialInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's income and expenses data and provide insights on their spending habits, highlighting potential overspending areas and offering suggestions for better financial management.

Income:
{{#each income}}
- Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Category: {{category}}
{{/each}}

Expenses:
{{#each expenses}}
- Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Category: {{category}}
{{/each}}

Insights:`,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: GenerateFinancialInsightsInputSchema,
    outputSchema: GenerateFinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
