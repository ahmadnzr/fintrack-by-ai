
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import type { Category } from "@/lib/types";
import { getIconComponent } from "@/lib/icon-map";

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void; 
}

export function CategoryList({ categories, onEditCategory, onDeleteCategory }: CategoryListProps) {
  
  const getTypeBadgeStyle = (type: Category['type']) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'expense':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
      default: // general
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                No categories match your search or filter.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <TableRow key={category.id}>
                  <TableCell>
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeBadgeStyle(category.type)}>
                      {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.isCustom ? (
                      <Badge variant="secondary">Custom</Badge>
                    ) : (
                      <Badge variant="outline">Predefined</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!category.isCustom}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Category actions for {category.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditCategory(category)} disabled={!category.isCustom}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onSelect={(e) => {
                                e.preventDefault(); 
                                onDeleteCategory(category);
                            }}
                            disabled={!category.isCustom}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
