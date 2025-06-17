import { AppHeader } from "@/components/layout/app-header";
import { AiFinancialInsights } from "@/components/reports/ai-insights";
import { ExportData } from "@/components/reports/export-data";

export default function ReportsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AppHeader title="Reports & Insights" />
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <AiFinancialInsights />
            <ExportData />
        </div>
      </div>
    </main>
  );
}
