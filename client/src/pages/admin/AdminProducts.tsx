import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useDeleteProduct, useImportProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileUp, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Note: Normally we'd include an elaborate form here, but keeping it simple for the structure
// Let's create a placeholder for the Add/Edit form.

export default function AdminProducts() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: products } = useProducts();
  const deleteProduct = useDeleteProduct();
  const importProducts = useImportProducts();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, isLoading]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      importProducts.mutate(formData, {
        onSuccess: (res) => {
          toast({ title: "Import Successful", description: res.message });
        },
        onError: () => {
          toast({ title: "Import Failed", variant: "destructive" });
        }
      });
      // reset input
      e.target.value = "";
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast({ title: "Product deleted" }),
      });
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-500">Manage catalog items, import CSV updates.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleImport}
              disabled={importProducts.isPending}
            />
            <Button variant="outline" disabled={importProducts.isPending}>
              <FileUp className="w-4 h-4 mr-2" />
              {importProducts.isPending ? "Importing..." : "Import CSV"}
            </Button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell className="font-medium text-slate-900">{p.name}</TableCell>
                <TableCell>{p.brand?.name || '-'}</TableCell>
                <TableCell>{p.category?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={p.availability === 'in_stock' ? 'default' : 'secondary'}>
                    {p.availability}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">No products found. Add some or import a CSV.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
