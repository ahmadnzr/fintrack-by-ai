
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, PlusCircle, Tag, MoreHorizontal } from "lucide-react";
import type { Category } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction, addCategoryAction, updateCategoryAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getIconComponent } from "@/lib/icon-map";

interface CategoryListProps {
  categories: Category[];
  onCategoryUpdate: () => void;
}

export function CategoryList({ categories, onCategoryUpdate }: CategoryListProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    if (!category.isCustom) {
      toast({ variant: "default", title: "Info", description: "Predefined categories cannot be edited." });
      return;
    }
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && !category.isCustom) {
      toast({ variant: "default", title: "Info", description: "Predefined categories cannot be deleted." });
      return;
    }

    const result = await deleteCategoryAction(id);
    if (result.success) {
      toast({ title: "Success", description: "Category deleted successfully." });
      onCategoryUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Failed to delete category." });
    }
  };

  const handleSubmitForm = async (data: any) => { // data type from CategoryFormValues
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    // Icon selection would be handled here if added to the form
    // formData.append('icon', data.icon); 
    
    let result;
    if (editingCategory) {
      result = await updateCategoryAction(editingCategory.id, formData);
    } else {
      result = await addCategoryAction(formData);
    }

    if (result.success) {
      toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'added'} successfully.` });
      onCategoryUpdate();
      setIsFormOpen(false);
      setEditingCategory(null);
      return { success: true };
    } else {
      toast({ variant: "destructive", title: "Error", description: (typeof result.error === 'string' ? result.error : result.error?._form?.join(', ')) || "Failed to save category." });
       return { success: false, error: result.error };
    }
  };
  
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
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>View, add, or edit your custom transaction categories.</CardDescription>
          </div>
          <Button onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-22rem)]"> {/* Adjust height as needed */}
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
                      No categories found. Add your first custom category!
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
                              <DropdownMenuItem onClick={() => handleEdit(category)} disabled={!category.isCustom}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <DropdownMenuItem 
                                      onSelect={(e) => e.preventDefault()} 
                                      disabled={!category.isCustom}
                                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the category "{category.name}".
                                      Transactions using this category will not be affected but might need re-categorization.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(category.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingCategory(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the details of your category." : "Create a new custom category."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCategory(null);
            }}
            formType={editingCategory ? "edit" : "add"}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
