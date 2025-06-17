"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExportData() {
  const { toast } = useToast();

  const handleExportPDF = () => {
    console.log("Exporting data to PDF...");
    toast({
      title: "Export Started (Mock)",
      description: "Data export to PDF has been initiated (this is a mock feature).",
    });
  };

  const handleExportExcel = () => {
    console.log("Exporting data to Excel...");
    toast({
      title: "Export Started (Mock)",
      description: "Data export to Excel has been initiated (this is a mock feature).",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Export Financial Data</CardTitle>
        <CardDescription>
          Download your transaction data in PDF or Excel format for external reporting or backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExportPDF} variant="outline" className="w-full sm:w-auto flex-1">
          <FileText className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
        <Button onClick={handleExportExcel} variant="outline" className="w-full sm:w-auto flex-1">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </CardContent>
    </Card>
  );
}
