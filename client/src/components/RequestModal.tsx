import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type InsertRequest } from "@shared/schema";
import { useCreateRequest } from "@/hooks/use-requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, MessageCircle, Send, X } from "lucide-react";

const MAX_CONTACT_URL = "https://max.ru/u/f9LHodD0cOJkvWZ--kfttkc1WOhrL8_Wi5cT2YxWIym59buaXyGWAYLUwOw";

interface RequestModalProps {
  productId?: number;
  productName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RequestModal({ productId, productName, trigger, open, onOpenChange }: RequestModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const { toast } = useToast();
  const createRequest = useCreateRequest();

  const form = useForm<InsertRequest>({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      productId: productId || null,
      name: "",
      email: "",
      phone: "",
      company: "",
      comment: productName ? `Интересует: ${productName}` : "",
      status: "new",
    },
  });

  const onSubmit = (data: InsertRequest) => {
    // Ensure numeric fields are correctly handled if needed by schema, but schema uses text for phone
    createRequest.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Заявка успешно отправлена",
          description: "Мы свяжемся с вами в ближайшее время для обсуждения условий.",
        });
        form.reset();
        handleOpenChange?.(false);
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка при отправке",
          description: error.message || "Пожалуйста, попробуйте позже или свяжитесь с нами через Max.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[680px] gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Оптовый запрос</DialogTitle>
          <DialogDescription>Форма запроса стоимости</DialogDescription>
        </DialogHeader>

        <div className="relative isolate max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[40px] bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.38)]">

          <div className="relative border-b border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6 md:px-8 md:py-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Оптовый запрос</p>
                <h2 className="mt-1 text-2xl md:text-3xl font-display font-bold text-white">Запросить стоимость</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-white">
                  <CalendarClock className="h-4 w-4" />
                  Ответ в ближайшее время
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="Закрыть"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>
            </div>
            {productName ? (
              <p className="mt-3 max-w-2xl text-sm text-slate-200/95">
                Позиция: <span className="font-semibold text-white">{productName}</span>
              </p>
            ) : (
              <p className="mt-3 max-w-2xl text-sm text-slate-200/95">
                Оставьте контакты, и мы подготовим предложение по вашим позициям.
              </p>
            )}
          </div>

          <div className="relative bg-white p-5 md:p-7">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Нужен быстрый ответ?</p>
                  <p className="text-sm text-slate-600">Напишите нам напрямую в Max.</p>
                </div>
                <a
                  href={MAX_CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  Открыть Max
                </a>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ваше имя</FormLabel>
                        <FormControl>
                          <Input className="h-11" placeholder="Иван Иванов" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер телефона</FormLabel>
                        <FormControl>
                          <Input className="h-11" placeholder="+7 (999) 000-00-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input className="h-11" type="email" placeholder="example@mail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Компания (необязательно)</FormLabel>
                        <FormControl>
                          <Input className="h-11" placeholder="ООО Название" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий / Необходимый объем</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите, какие позиции и объемы вас интересуют"
                          className="min-h-[120px] resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl border-none bg-primary text-white font-semibold transition-colors hover:bg-primary/90"
                  disabled={createRequest.isPending}
                >
                  {createRequest.isPending ? "Отправка..." : "Отправить запрос"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
