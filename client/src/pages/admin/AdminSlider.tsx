import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
} from "@/hooks/use-hero-slides";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropzone } from "@/components/admin/ImageDropzone";

export default function AdminSlider() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: slides, isLoading: slidesLoading } = useHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    sortOrder: "1",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (editingSlide) {
      setFormData({
        title: editingSlide.title || "",
        description: editingSlide.description || "",
        image: editingSlide.image || "",
        sortOrder: String(editingSlide.sortOrder ?? 1),
      });
    } else {
      setFormData({
        title: "",
        description: "",
        image: "",
        sortOrder: "1",
      });
    }
  }, [editingSlide]);

  const handleDelete = (id: number) => {
    if (!confirm("Удалить этот слайд?")) return;
    deleteSlide.mutate(id, {
      onSuccess: () => toast({ title: "Слайд удален" }),
      onError: (error: any) =>
        toast({
          title: "Ошибка удаления",
          description: error?.message || "Не удалось удалить слайд",
          variant: "destructive",
        }),
    });
  };

  const handleSave = () => {
    const title = formData.title.trim();
    const description = formData.description.trim();
    const image = formData.image.trim();
    const sortOrderNumber = Number.parseInt(formData.sortOrder, 10);

    if (!title || !description || !image) {
      toast({
        title: "Заполните обязательные поля",
        description: "Укажите заголовок, текст и фото слайда.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(sortOrderNumber)) {
      toast({
        title: "Некорректный порядок",
        description: "Введите число в поле порядка показа.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title,
      description,
      image,
      sortOrder: sortOrderNumber,
    };

    if (editingSlide) {
      updateSlide.mutate(
        { id: editingSlide.id, ...payload },
        {
          onSuccess: () => {
            toast({ title: "Слайд обновлен" });
            setIsDialogOpen(false);
          },
          onError: (error: any) =>
            toast({
              title: "Ошибка сохранения",
              description: error?.message || "Не удалось сохранить слайд",
              variant: "destructive",
            }),
        },
      );
      return;
    }

    createSlide.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: "Слайд добавлен" });
        setIsDialogOpen(false);
      },
      onError: (error: any) =>
        toast({
          title: "Ошибка создания",
          description: error?.message || "Не удалось создать слайд",
          variant: "destructive",
        }),
    });
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Слайдер</h1>
          <p className="text-slate-500">Управление слайдами на главной странице.</p>
        </div>
        <Button
          className="rounded-lg h-10 px-4 bg-primary text-white hover:bg-primary/90 transition-colors shadow-md border-none font-bold"
          onClick={() => {
            setEditingSlide(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Добавить слайд
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {slidesLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold py-4 text-slate-700">Порядок</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Слайд</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Изображение</TableHead>
                <TableHead className="text-right font-bold py-4 text-slate-700">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides?.map((slide) => (
                <TableRow key={slide.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500">{slide.sortOrder}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{slide.title}</div>
                    <div className="text-sm text-slate-500 line-clamp-2 max-w-lg">{slide.description}</div>
                  </TableCell>
                  <TableCell>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-40 aspect-video object-cover rounded-md border border-slate-200"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-primary transition-colors"
                      onClick={() => {
                        setEditingSlide(slide);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-destructive transition-colors"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {slides?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-20 font-medium italic">
                    Слайды не добавлены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSlide ? "Редактировать слайд" : "Новый слайд"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Заголовок</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Заголовок для слайда"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Текст</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткий текст слайда"
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Фото слайда</Label>
              <ImageDropzone
                value={formData.image ? [formData.image] : []}
                onChange={(images) => setFormData({ ...formData, image: images[0] ?? "" })}
                maxFiles={1}
                previewAspect="landscape"
                hint="Рекомендуемый формат: горизонтальный 16:9 или 21:9."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Порядок показа</Label>
              <Input
                type="number"
                min={1}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-6">
            <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button className="border-none bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 shadow-lg shadow-primary/20 transition-all" onClick={handleSave}>
              {editingSlide ? "Сохранить изменения" : "Создать слайд"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
