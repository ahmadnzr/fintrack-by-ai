"use client";

import * as React from "react";
import { CategoryList } from "@/components/categories/category-list";
import type { Category } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface CategoriesPageClientProps {
  initialCategories: Category[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const router = useRouter();
  const [categories, setCategories] = React.useState(initialCategories);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCategoryUpdate = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button variant="outline" size="icon" onClick={handleCategoryUpdate} aria-label="Refresh categories">
                <RotateCw className="h-4 w-4"/>
            </Button>
        </div>
        <CategoryList categories={categories} onCategoryUpdate={handleCategoryUpdate} />
    </div>
  );
}
