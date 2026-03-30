import { z } from "zod";

export const requestFormSchema = z.object({
  productId: z.number().nullable().optional(),
  name: z.string().min(2, "Введите ваше имя"),
  email: z.string().trim().email("Введите корректный email"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  company: z.string().optional().nullable(),
  comment: z.string().min(5, "Пожалуйста, опишите ваш запрос"),
  status: z.string().default("new"),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

