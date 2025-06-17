import { AppHeader } from "@/components/layout/app-header";
import { CategoryList } from "@/components/categories/category-list";
import { getAllCategories } from "@/lib/data";
import { CategoriesPageClient } from "./categories-page-client";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Categories" />
      <div className="px-4 sm:px-0">
        <CategoriesPageClient initialCategories={categories} />
      </div>
    </main>
  );
}
