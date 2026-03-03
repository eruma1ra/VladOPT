import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useDeleteProduct, useImportProducts, useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileUp, Edit, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProducts() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();
  const importProducts = useImportProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    descriptionShort: "",
    categoryId: "",
    availability: "in_stock",
    images: "",
    attributes: ""
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        sku: editingProduct.sku || "",
        name: editingProduct.name || "",
        descriptionShort: editingProduct.descriptionShort || "",
        categoryId: editingProduct.categoryId?.toString() || "",
        availability: editingProduct.availability || "in_stock",
        images: Array.isArray(editingProduct.images) ? editingProduct.images.join(", ") : "",
        attributes: JSON.stringify(editingProduct.attributes || {})
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        descriptionShort: "",
        categoryId: "",
        availability: "in_stock",
        images: "",
        attributes: "{}"
      });
    }
  }, [editingProduct]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      importProducts.mutate(formData, {
        onSuccess: (res) => {
          toast({ title: "Импорт завершен", description: `Загружено: ${res.imported}, Обновлено: ${res.updated}` });
        },
        onError: () => {
          toast({ title: "Ошибка импорта", variant: "destructive" });
        }
      });
      e.target.value = "";
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast({ title: "Товар удален" }),
      });
    }
  };

  const handleSave = () => {
    const images = formData.images.split(",").map(s => s.trim()).filter(s => s);
    let attributes = {};
    try {
      attributes = JSON.parse(formData.attributes);
    } catch (e) {
      toast({ title: "Ошибка JSON", description: "Проверьте формат характеристик", variant: "destructive" });
      return;
    }

    const data = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      images,
      attributes
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Товар обновлен" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createProduct.mutate(data as any, {
        onSuccess: () => {
          toast({ title: "Товар создан" });
          setIsDialogOpen(false);
        }
      });
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Управление товарами</h1>
          <p className="text-slate-500">Добавление, редактирование и импорт товаров из CSV.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-none" onClick={() => window.open('/api/products/export')}>
            <FileDown className="w-4 h-4 mr-2" /> Экспорт CSV
          </Button>
          <div className="relative">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleImport}
              disabled={importProducts.isPending}
            />
            <Button variant="outline" className="border-none" disabled={importProducts.isPending}>
              <FileUp className="w-4 h-4 mr-2" />
              {importProducts.isPending ? "Загрузка..." : "Импорт CSV"}
            </Button>
          </div>
          <Button className="border-none" onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Добавить товар
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {productsLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Артикул</TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium text-slate-900">{p.name}</TableCell>
                  <TableCell>{p.category?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={p.availability === 'in_stock' ? 'default' : 'secondary'} className="border-none">
                      {p.availability === 'in_stock' ? 'В наличии' : p.availability === 'preorder' ? 'Под заказ' : 'Нет в наличии'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}>
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
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">Товары не найдены. Добавьте новые или импортируйте из CSV.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Артикул</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">В наличии</SelectItem>
                    <SelectItem value="preorder">Под заказ</SelectItem>
                    <SelectItem value="out_of_stock">Нет в наличии</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Наименование</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Краткое описание</Label>
              <Textarea value={formData.descriptionShort} onChange={e => setFormData({...formData, descriptionShort: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Ссылки на фото (через запятую)</Label>
              <Input value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Характеристики (JSON)</Label>
              <Textarea value={formData.attributes} onChange={e => setFormData({...formData, attributes: e.target.value})} className="font-mono text-xs" />
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
