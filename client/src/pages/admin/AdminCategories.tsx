import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories, useDeleteCategory, useDeleteAllCategories, useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [search, setSearch] = useState("");

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

  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, search]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Категории</h1>
          <p className="text-slate-500">Управление структурой каталога.</p>
        </div>
        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 md:flex items-stretch gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
            onClick={handleDeleteAll}
            disabled={deleteAllCategories.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteAllCategories.isPending ? "Удаление..." : "Удалить все"}
          </Button>
          <Button className="rounded-xl border-none w-full" onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Добавить категорию
          </Button>
        </div>
      </div>

      <div className="catalog-search-shell mb-4 w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию категории"
          className="pl-12 h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:shadow-none text-[15px] placeholder:text-slate-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((c) => (
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
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-16 font-medium italic">
                  Категории не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[520px]">
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
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto border-none" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button className="w-full sm:w-auto border-none" onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
