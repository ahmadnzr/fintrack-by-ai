"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateFinancialInsightsAction } from "@/lib/actions";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AiFinancialInsights() {
  const [insights, setInsights] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await generateFinancialInsightsAction();
      if (result.insights) {
        setInsights(result.insights);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (e: any) {
      setError("An unexpected error occurred: " + e.message);
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>
          Get personalized insights and suggestions based on your spending habits.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating insights, please wait...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-4 bg-destructive/10 border border-destructive rounded-md">
            <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-destructive font-medium text-center">Error Generating Insights</p>
            <p className="text-destructive/80 text-sm text-center mt-1">{error}</p>
          </div>
        )}
        {insights && !isLoading && !error && (
          <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/20">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              <h3 className="font-semibold text-foreground">Your Financial Insights:</h3>
              <p>{insights}</p>
            </div>
          </ScrollArea>
        )}
        {!isLoading && !insights && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Click the button below to generate your financial insights.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Insights
        </Button>
      </CardFooter>
    </Card>
  );
}
