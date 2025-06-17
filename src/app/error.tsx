// src/app/error.tsx
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4 font-headline">
          Oops! Something went wrong.
        </h2>
        <p className="text-muted-foreground mb-8">
          We're sorry for the inconvenience. An unexpected error occurred.
          You can try to refresh the page or go back to the dashboard.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Error details: {error.message}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            variant="default"
            size="lg"
          >
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
