import { AppHeader } from "@/components/layout/app-header";
import { CategoriesPageClient } from "./categories-page-client";

export default async function CategoriesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Categories" />
      <div className="px-4 sm:px-0">
        <CategoriesPageClient />
      </div>
    </main>
  );
}
