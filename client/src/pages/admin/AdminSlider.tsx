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
    image: "",
    sortOrder: "1",
  });

  const getNextSortOrder = () => {
    if (!slides?.length) return 1;
    return (
      Math.max(
        ...slides.map((slide) =>
          Number.isFinite(slide.sortOrder) ? slide.sortOrder : 0,
        ),
      ) + 1
    );
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (editingSlide) {
      setFormData({
        image: editingSlide.image || "",
        sortOrder: String(editingSlide.sortOrder ?? 1),
      });
    } else {
      setFormData({
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
    const image = formData.image.trim();
    const parsedSortOrder = Number.parseInt(formData.sortOrder, 10);
    const sortOrderNumber = Number.isFinite(parsedSortOrder) && parsedSortOrder > 0
      ? parsedSortOrder
      : null;

    if (!image) {
      toast({
        title: "Загрузите фото",
        description: "Для слайда нужно выбрать изображение.",
        variant: "destructive",
      });
      return;
    }

    if (!sortOrderNumber) {
      toast({
        title: "Некорректный порядок",
        description: "Введите число больше 0.",
        variant: "destructive",
      });
      return;
    }

    if (editingSlide) {
      updateSlide.mutate(
        {
          id: editingSlide.id,
          image,
          sortOrder: sortOrderNumber,
        },
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

    createSlide.mutate(
      {
        title: `Слайд ${sortOrderNumber}`,
        description: "",
        image,
        sortOrder: sortOrderNumber,
      } as any,
      {
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
      },
    );
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Слайдер</h1>
          <p className="text-slate-500">Управление слайдами на главной странице.</p>
        </div>
        <Button
          className="rounded-lg h-10 px-4 bg-primary text-white hover:bg-primary/90 transition-colors shadow-md border-none font-bold w-full md:w-auto"
          onClick={() => {
            setEditingSlide(null);
            setFormData({
              image: "",
              sortOrder: String(getNextSortOrder()),
            });
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
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-bold py-4 text-slate-700">Порядок</TableHead>
                <TableHead className="font-bold py-4 text-slate-700">Изображение</TableHead>
                <TableHead className="text-right font-bold py-4 text-slate-700">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides?.map((slide) => (
                <TableRow key={slide.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500">{slide.sortOrder}</TableCell>
                  <TableCell>
                    <img
                      src={slide.image}
                      alt={`Слайд ${slide.sortOrder}`}
                      className="w-52 aspect-video object-contain rounded-md border border-slate-200 bg-slate-100"
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
                  <TableCell colSpan={3} className="text-center text-slate-500 py-20 font-medium italic">
                    Слайды не добавлены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSlide ? "Редактировать слайд" : "Новый слайд"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Фото слайда</Label>
              <ImageDropzone
                value={formData.image ? [formData.image] : []}
                onChange={(images) => setFormData({ ...formData, image: images[0] ?? "" })}
                maxFiles={1}
                previewAspect="landscape"
                hint="Горизонтальный формат 21:9."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Порядок показа</Label>
              <Input
                type="number"
                min={1}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                placeholder="Например, 1"
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4 border-t pt-6">
            <Button variant="ghost" className="w-full sm:w-auto font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button className="w-full sm:w-auto border-none bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 shadow-lg shadow-primary/20 transition-all" onClick={handleSave}>
              {editingSlide ? "Сохранить изменения" : "Создать слайд"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
