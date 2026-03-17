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
        availability: editingProduct.availability === "in_stock" ? "in_stock" : "out_of_stock",
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Товары</h1>
          <p className="text-slate-500">Управление ассортиментом каталога.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="rounded-lg h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-medium" 
            onClick={() => window.open('/api/products/export')}
          >
            <FileDown className="w-4 h-4 mr-2" /> Экспорт
          </Button>
          <div className="relative">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleImport}
              disabled={importProducts.isPending}
            />
            <Button 
              variant="outline" 
              className="rounded-lg h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-medium" 
              disabled={importProducts.isPending}
            >
              <FileUp className="w-4 h-4 mr-2" />
              {importProducts.isPending ? "Загрузка..." : "Импорт"}
            </Button>
          </div>
          <Button 
            className="rounded-lg h-10 px-4 bg-primary text-white hover:bg-primary/90 transition-colors shadow-md border-none font-bold" 
            onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}
          >
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
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold py-4 text-slate-700">Артикул</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Наименование</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Категория</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Статус</TableHead>
                <TableHead className="text-right font-bold py-4 text-slate-700">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500">{p.sku}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{p.category?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      className={`border-none font-medium ${
                        p.availability === 'in_stock' ? 'bg-green-500 text-white' : 'bg-red-400/85 text-white'
                      }`}
                    >
                      {p.availability === 'in_stock' ? 'В наличии' : 'Ожидается'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary transition-colors" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive transition-colors" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {products?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-20 font-medium italic">Товары не найдены. Добавьте новые или импортируйте из CSV.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Артикул (SKU)</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Напр: VLV-100" className="bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Статус наличия</Label>
                <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                  <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">В наличии</SelectItem>
                    <SelectItem value="out_of_stock">Ожидается</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Наименование товара</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Полное название товара" className="bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Категория каталога</Label>
              <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Краткое описание (для сайта)</Label>
              <Textarea value={formData.descriptionShort} onChange={e => setFormData({...formData, descriptionShort: e.target.value})} placeholder="Основные преимущества или особенности" className="min-h-[100px] bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Ссылки на изображения (через запятую)</Label>
              <Input value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://image1.jpg, https://image2.jpg" className="bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Технические характеристики (JSON)</Label>
              <Textarea value={formData.attributes} onChange={e => setFormData({...formData, attributes: e.target.value})} className="font-mono text-xs bg-slate-900 text-slate-100 p-4 min-h-[120px] rounded-lg" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-6">
            <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button className="border-none bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95" onClick={handleSave}>
              {editingProduct ? 'Сохранить изменения' : 'Создать товар'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
