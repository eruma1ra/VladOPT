import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useDeleteProduct, useDeleteAllProducts, useImportProducts, useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileUp, Edit, FileDown, Loader2, Search, House } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/admin/ImageDropzone";

const ATTRIBUTE_ORDER_KEY = "__order";

function sanitizeAttributesForEditor(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const source = raw as Record<string, unknown>;
  const allKeys = Object.keys(source).filter((key) => key !== ATTRIBUTE_ORDER_KEY);
  const rawOrder = source[ATTRIBUTE_ORDER_KEY];
  const order = Array.isArray(rawOrder)
    ? rawOrder.filter((key): key is string => typeof key === "string")
    : [];

  const sortedKeys = [...order.filter((key) => allKeys.includes(key)), ...allKeys.filter((key) => !order.includes(key))];
  const cleaned: Record<string, unknown> = {};
  for (const key of sortedKeys) cleaned[key] = source[key];

  return cleaned;
}

function attachAttributeOrder(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const source = raw as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  const orderedKeys: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (key === ATTRIBUTE_ORDER_KEY) continue;
    result[key] = value;
    orderedKeys.push(key);
  }

  result[ATTRIBUTE_ORDER_KEY] = orderedKeys;
  return result;
}

export default function AdminProducts() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim();
  const { data: products, isLoading: productsLoading } = useProducts({
    search: normalizedSearch.length > 0 ? normalizedSearch : undefined,
  });
  const sortedProducts = useMemo(
    () => [...(products ?? [])].sort((a, b) => b.id - a.id),
    [products],
  );
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();
  const deleteAllProducts = useDeleteAllProducts();
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
    showOnHome: false,
    images: [] as string[],
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
        showOnHome: Boolean(editingProduct.showOnHome),
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [],
        attributes: JSON.stringify(sanitizeAttributesForEditor(editingProduct.attributes || {}), null, 2)
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        descriptionShort: "",
        categoryId: "",
        availability: "in_stock",
        showOnHome: false,
        images: [],
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
          const errorCount = Array.isArray(res?.errors) ? res.errors.length : 0;
          const baseDescription = `Загружено: ${res.imported}, Обновлено: ${res.updated}`;

          if (errorCount > 0) {
            toast({
              title: "Импорт завершен с предупреждениями",
              description: `${baseDescription}, Ошибки: ${errorCount}`,
              variant: "destructive",
            });
          } else {
            toast({ title: "Импорт завершен", description: baseDescription });
          }
        },
        onError: (error: any) => {
          toast({
            title: "Ошибка импорта",
            description: error?.message || "Не удалось импортировать файл",
            variant: "destructive",
          });
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

  const handleDeleteAll = () => {
    if (!products?.length) {
      toast({ title: "Список товаров уже пуст" });
      return;
    }

    if (!confirm(`Удалить все товары (${products.length} шт.)? Это действие нельзя отменить.`)) {
      return;
    }

    deleteAllProducts.mutate(undefined, {
      onSuccess: (res) => {
        toast({ title: "Все товары удалены", description: `Удалено: ${res?.deleted ?? 0}` });
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка удаления",
          description: error?.message || "Не удалось удалить товары",
          variant: "destructive",
        });
      },
    });
  };

  const handleSave = () => {
    let parsedAttributes: unknown = {};
    try {
      parsedAttributes = JSON.parse(formData.attributes);
    } catch (e) {
      toast({ title: "Ошибка JSON", description: "Проверьте формат характеристик", variant: "destructive" });
      return;
    }

    if (!parsedAttributes || typeof parsedAttributes !== "object" || Array.isArray(parsedAttributes)) {
      toast({ title: "Ошибка JSON", description: "Характеристики должны быть объектом JSON", variant: "destructive" });
      return;
    }

    const attributes = attachAttributeOrder(parsedAttributes);

    const data = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      images: formData.images,
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

  const handleToggleHomeProduct = (product: any) => {
    updateProduct.mutate(
      { id: product.id, showOnHome: !product.showOnHome },
      {
        onSuccess: () => {
          toast({
            title: !product.showOnHome ? "Товар добавлен на главную" : "Товар снят с главной",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Ошибка обновления",
            description: error?.message || "Не удалось изменить отображение на главной",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full xl:w-auto">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Товары</h1>
          <p className="text-slate-500">Управление ассортиментом каталога.</p>
          <div className="catalog-search-shell mt-3 w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или артикулу"
              className="pl-12 h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:shadow-none text-[15px] placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="w-full xl:w-auto grid grid-cols-1 sm:grid-cols-2 xl:flex items-stretch gap-2">
          <Button 
            variant="outline" 
            className="rounded-lg h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-medium w-full" 
            onClick={() => window.open('/api/products/export')}
          >
            <FileDown className="w-4 h-4 mr-2" /> Экспорт
          </Button>
          <div className="relative w-full">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleImport}
              disabled={importProducts.isPending}
            />
            <Button 
              variant="outline" 
              className="rounded-lg h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-medium w-full" 
              disabled={importProducts.isPending}
            >
              <FileUp className="w-4 h-4 mr-2" />
              {importProducts.isPending ? "Загрузка..." : "Импорт"}
            </Button>
          </div>
          <Button
            variant="outline"
            className="rounded-lg h-10 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm font-medium"
            onClick={handleDeleteAll}
            disabled={deleteAllProducts.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteAllProducts.isPending ? "Удаление..." : "Удалить все"}
          </Button>
          <Button 
            className="rounded-lg h-10 px-4 bg-primary text-white hover:bg-primary/90 transition-colors shadow-md border-none font-bold w-full" 
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
          <Table className="min-w-[1040px]">
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold py-4 text-slate-700">Артикул</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Наименование</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Категория</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Статус</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Главная</TableHead>
                <TableHead className="text-right font-bold py-4 text-slate-700">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500">{p.sku}</TableCell>
                  <TableCell className="font-semibold text-slate-900 max-w-[380px] whitespace-normal break-words leading-5">
                    {p.name}
                  </TableCell>
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
                  <TableCell>
                    <Badge className={p.showOnHome ? "border-none bg-primary/15 text-primary" : "border-none bg-slate-100 text-slate-500"}>
                      {p.showOnHome ? "Показан" : "Скрыт"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={p.showOnHome ? "Убрать с главной" : "Поместить на главный экран"}
                      className={p.showOnHome ? "text-primary hover:text-primary" : "text-slate-400 hover:text-primary transition-colors"}
                      onClick={() => handleToggleHomeProduct(p)}
                    >
                      <House className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary transition-colors" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive transition-colors" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-20 font-medium italic">Товары не найдены. Добавьте новые или импортируйте из CSV.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Артикул (SKU)</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Напр: VLV-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Статус наличия</Label>
                <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">В наличии</SelectItem>
                    <SelectItem value="out_of_stock">Ожидается</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Показ на главной</p>
                <p className="text-xs text-slate-500">Если включено, товар будет отображаться на главном экране.</p>
              </div>
              <Button
                type="button"
                variant={formData.showOnHome ? "default" : "outline"}
                className={formData.showOnHome ? "border-none" : "border-slate-300"}
                onClick={() => setFormData((prev) => ({ ...prev, showOnHome: !prev.showOnHome }))}
              >
                {formData.showOnHome ? "Показан" : "Скрыт"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Наименование товара</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Полное название товара" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Категория каталога</Label>
              <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Краткое описание (для сайта)</Label>
              <Textarea value={formData.descriptionShort} onChange={e => setFormData({...formData, descriptionShort: e.target.value})} placeholder="Основные преимущества или особенности" className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Изображения товара</Label>
              <ImageDropzone
                value={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxFiles={8}
                previewAspect="square"
                hint="Рекомендуемый формат товара: квадрат 1:1."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Технические характеристики (JSON)</Label>
              <Textarea value={formData.attributes} onChange={e => setFormData({...formData, attributes: e.target.value})} className="font-mono text-xs bg-slate-900 text-slate-100 p-4 min-h-[120px] rounded-lg" />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4 border-t pt-6">
            <Button variant="ghost" className="w-full sm:w-auto font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button className="w-full sm:w-auto border-none bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95" onClick={handleSave}>
              {editingProduct ? 'Сохранить изменения' : 'Создать товар'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
