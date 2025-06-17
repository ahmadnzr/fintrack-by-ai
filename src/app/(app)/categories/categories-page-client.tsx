
"use client";

import * as React from "react";
import type { Category } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCw, PlusCircle, Search, Filter as FilterIcon } from "lucide-react"; // Renamed Filter to FilterIcon
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryList } from "@/components/categories/category-list";
import { addCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CategoriesPageClientProps {
  initialCategories: Category[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = React.useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "income" | "expense" | "general">("all");
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);


  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCategoryUpdate = () => {
    router.refresh();
  };

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: Category) => {
     if (!category.isCustom) {
      toast({ variant: "default", title: "Info", description: "Predefined categories cannot be edited." });
      return;
    }
    setEditingCategory(category);
    setIsFormOpen(true);
  };
  
  const confirmDeleteCategory = (category: Category) => {
    if (!category.isCustom) {
      toast({ variant: "default", title: "Info", description: "Predefined categories cannot be deleted." });
      return;
    }
    setCategoryToDelete(category);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const result = await deleteCategoryAction(categoryToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: "Category deleted successfully." });
      handleCategoryUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Failed to delete category." });
    }
    setCategoryToDelete(null); // Close dialog
  };


  const handleSubmitForm = async (data: any) => { // data type from CategoryFormValues
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    // formData.append('icon', data.icon); // If icon selection is added to form

    let result;
    if (editingCategory) {
      result = await updateCategoryAction(editingCategory.id, formData);
    } else {
      result = await addCategoryAction(formData);
    }

    if (result.success) {
      toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'added'} successfully.` });
      handleCategoryUpdate();
      setIsFormOpen(false);
      setEditingCategory(null);
      return { success: true };
    } else {
      toast({ variant: "destructive", title: "Error", description: (typeof result.error === 'string' ? result.error : result.error?._form?.join(', ')) || "Failed to save category." });
      return { success: false, error: result.error };
    }
  };

  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || category.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, filterType]);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-y-2">
          <div>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>View, add, or edit your custom transaction categories.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={handleCategoryUpdate} aria-label="Refresh categories">
                <RotateCw className="h-4 w-4"/>
             </Button>
            <Button onClick={handleOpenAddForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by category name..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by type">
                  <FilterIcon className="h-4 w-4 mr-2 inline-block" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CategoryList 
            categories={filteredCategories} 
            onEditCategory={handleOpenEditForm}
            onDeleteCategory={confirmDeleteCategory}
            onCategoryUpdate={handleCategoryUpdate} 
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingCategory(null); // Reset editingCategory when dialog closes
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

      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category "{categoryToDelete.name}".
                Transactions using this category will not be affected but might need re-categorization.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
