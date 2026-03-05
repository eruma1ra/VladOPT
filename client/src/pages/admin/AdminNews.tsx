import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNews, useCreateNews, useUpdateNews, useDeleteNews } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminNews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: newsItems, isLoading: newsLoading } = useNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    status: "active"
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        content: editingItem.content || "",
        image: editingItem.image || "",
        status: editingItem.status || "active"
      });
    } else {
      setFormData({
        title: "",
        content: "",
        image: "",
        status: "active"
      });
    }
  }, [editingItem]);

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту новость?")) {
      deleteNews.mutate(id, {
        onSuccess: () => toast({ title: "Новость удалена" }),
      });
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Ошибка", description: "Заполните заголовок и содержание", variant: "destructive" });
      return;
    }

    if (editingItem) {
      updateNews.mutate({ id: editingItem.id, ...formData }, {
        onSuccess: () => {
          toast({ title: "Новость обновлена" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createNews.mutate(formData as any, {
        onSuccess: () => {
          toast({ title: "Новость создана" });
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
          <h1 className="text-3xl font-display font-bold text-slate-900">Новости</h1>
          <p className="text-slate-500">Управление новостями и предложениями на сайте.</p>
        </div>
        <Button 
          className="rounded-lg h-10 px-4 bg-primary text-white hover:bg-primary/90 transition-colors shadow-md border-none font-bold" 
          onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Добавить новость
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {newsLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold py-4 text-slate-700">Дата</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Заголовок</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Статус</TableHead>
                <TableHead className="text-right font-bold py-4 text-slate-700">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsItems?.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-sm text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{item.title}</TableCell>
                  <TableCell>
                    <Badge className={`border-none font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' :
                      item.status === 'limited_offer' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status === 'active' ? 'Активна' : 
                       item.status === 'limited_offer' ? 'Предложение' : 'Архив'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary transition-colors" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive transition-colors" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {newsItems?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-20 font-medium italic">Новости не найдены.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingItem ? 'Редактировать новость' : 'Новая новость'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Заголовок</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Заголовок новости" className="bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Статус</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="limited_offer">Ограниченное предложение</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Ссылка на фото</Label>
              <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Текст новости</Label>
              <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Полный текст новости" className="min-h-[200px] bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-6">
            <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button className="border-none bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 shadow-lg shadow-primary/20 transition-all" onClick={handleSave}>
              {editingItem ? 'Сохранить изменения' : 'Создать новость'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
