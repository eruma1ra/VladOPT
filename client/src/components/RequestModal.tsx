import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type InsertRequest } from "@shared/schema";
import { useCreateRequest } from "@/hooks/use-requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { MessageCircle, Send } from "lucide-react";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Оптовый запрос</DialogTitle>
          <DialogDescription>
            Оставьте свои контактные данные, чтобы получить полный прайс-лист и условия сотрудничества.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center text-center gap-3">
            <p className="text-sm text-blue-800">Нужен быстрый ответ в Max?</p>
            <a 
              href={MAX_CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Написать нам в Max
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Или заполните форму</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваше имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Иванов" {...field} />
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
                      <Input placeholder="+7 (999) 000-00-00" {...field} />
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
                      <Input type="email" placeholder="example@mail.com" {...field} />
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
                      <Input placeholder="ООО Название" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий / Необходимый объем</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Меня интересует..." 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 border-none"
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Отправка..." : "Отправить запрос"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
