import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: categories } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, isLoading]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure? This might break products linked to this category.")) {
      deleteCategory.mutate(id, {
        onSuccess: () => toast({ title: "Category deleted" }),
        onError: () => toast({ title: "Failed to delete", variant: "destructive" })
      });
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">Manage catalog taxonomy.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{c.slug}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
