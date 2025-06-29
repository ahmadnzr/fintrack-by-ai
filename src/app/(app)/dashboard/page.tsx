
import { AppHeader } from "@/components/layout/app-header";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Dashboard" />
      <DashboardClient />
    </main>
  );
}
