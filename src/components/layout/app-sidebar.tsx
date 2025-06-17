
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
import { SheetTitle } from "@/components/ui/sheet";
import React, { useEffect, useState } from "react"; // Added useEffect, useState

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings">
              <SidebarMenuButton
                isActive={pathname === "/settings"}
                tooltip="Settings"
                className="justify-start"
              >
                <Settings className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
