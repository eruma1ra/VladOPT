import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories, useDeleteCategory, useDeleteAllCategories, useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminCategories() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: categories } = useCategories();
  const deleteCategory = useDeleteCategory();
  const deleteAllCategories = useDeleteAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (editingCategory) {
      setFormData({ name: editingCategory.name, slug: editingCategory.slug });
    } else {
      setFormData({ name: "", slug: "" });
    }
  }, [editingCategory]);

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены? Это может затронуть товары в этой категории.")) {
      deleteCategory.mutate(id, {
        onSuccess: () => toast({ title: "Категория удалена" }),
        onError: () => toast({ title: "Ошибка удаления", variant: "destructive" })
      });
    }
  };

  const handleDeleteAll = () => {
    if (!categories?.length) {
      toast({ title: "Список категорий уже пуст" });
      return;
    }

    if (!confirm(`Удалить все категории (${categories.length} шт.)? Товары сохранятся, но категории у них очистятся.`)) {
      return;
    }

    deleteAllCategories.mutate(undefined, {
      onSuccess: (res) => {
        toast({ title: "Все категории удалены", description: `Удалено: ${res?.deleted ?? 0}` });
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка удаления",
          description: error?.message || "Не удалось удалить категории",
          variant: "destructive",
        });
      },
    });
  };

  const handleSave = () => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...formData }, {
        onSuccess: () => {
          toast({ title: "Категория обновлена" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createCategory.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Категория создана" });
          setIsDialogOpen(false);
        }
      });
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Категории</h1>
          <p className="text-slate-500">Управление структурой каталога.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleDeleteAll}
            disabled={deleteAllCategories.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteAllCategories.isPending ? "Удаление..." : "Удалить все"}
          </Button>
          <Button className="rounded-xl border-none" onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Добавить категорию
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{c.slug}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" onClick={() => { setEditingCategory(c); setIsDialogOpen(true); }}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Редактировать" : "Создать"} категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Slug (английские буквы)</Label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-none" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button className="border-none" onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
