
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Shapes,
  FileText,
  DollarSign,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_NAME } from "@/lib/constants";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/categories", label: "Categories", icon: Shapes },
  { href: "/reports", label: "Reports & Insights", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(storedTheme);
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const storedLanguage = localStorage.getItem("language") || "en";
    setSelectedLanguage(storedLanguage);
    // Add actual language switching logic here if implemented
  }, []);

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light";
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);
    // Add actual language switching logic here if implemented
    // For now, it just updates state and local storage
    console.log("Language changed to:", lang);
     // Optionally, show a toast or refresh the page if needed for language changes
  };


  return (
    <Sidebar side="left" collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <DollarSign className="h-8 w-8 text-primary group-data-[state=expanded]:text-sidebar-primary" />
          {mounted && isMobile ? (
            <SheetTitle asChild>
              <h1 className="text-2xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                {APP_NAME}
              </h1>
            </SheetTitle>
          ) : (
            <h1 className="text-2xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              {APP_NAME}
            </h1>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogTrigger asChild>
            <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Settings"
                    className="justify-start"
                    // isActive={isSettingsDialogOpen} // Optional: highlight if dialog is open
                  >
                    <Settings className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Application Settings</DialogTitle>
              <DialogDescription>
                Manage your theme and language preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme-toggle" className="text-base font-medium">Theme</Label>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <Sun className="h-5 w-5" />
                  <Switch
                    id="theme-toggle"
                    checked={currentTheme === "dark"}
                    onCheckedChange={handleThemeChange}
                    aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
                  />
                  <Moon className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Current theme: {currentTheme === 'light' ? 'Light' : 'Dark'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language-select" className="text-base font-medium">Language</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Bahasa Indonesia (Placeholder)</SelectItem>
                    <SelectItem value="es">Español (Placeholder)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selected language: {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'id' ? 'Bahasa Indonesia' : 'Español'}. Language switching is a placeholder.
                </p>
              </div>
            </div>
            {/* Optional: DialogFooter for close button if needed, but default X button is present */}
            {/* <DialogFooter> <Button onClick={() => setIsSettingsDialogOpen(false)}>Close</Button> </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
