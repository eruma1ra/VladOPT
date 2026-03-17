import nodemailer from "nodemailer";
import type { Product, Request } from "@shared/schema";

type RequestProductPreview = Pick<Product, "name" | "sku"> | null;

let cachedTransporter: nodemailer.Transporter | null | undefined;
let warnedMissingConfig = false;

function buildTransporter(): nodemailer.Transporter | null {
  const smtpUrl = process.env.SMTP_URL;
  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    if (!warnedMissingConfig) {
      console.warn(
        "[request-notifier] SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS."
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

function getTransporter(): nodemailer.Transporter | null {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  cachedTransporter = buildTransporter();
  return cachedTransporter;
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ru-RU");
}

export async function sendRequestNotificationByEmail(params: {
  request: Request;
  product: RequestProductPreview;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const to = (process.env.REQUEST_NOTIFY_EMAIL ?? "sale@vladopt.ru").trim();
  const from = (process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "no-reply@vladopt.ru").trim();

  const { request, product } = params;
  const subject = product?.name
    ? `Новая заявка по товару: ${product.name}`
    : "Новая заявка с сайта";

  const productLabel = product?.name
    ? `${product.name}${product.sku ? ` (арт. ${product.sku})` : ""}`
    : request.productId
      ? `ID товара: ${request.productId}`
      : "Не указан";

  const text = [
    "Новая заявка с сайта VladOPT",
    "",
    `Дата: ${formatDate(request.createdAt)}`,
    `Статус: ${request.status}`,
    "",
    `Товар: ${productLabel}`,
    `Имя: ${request.name}`,
    `Телефон: ${request.phone}`,
    `Email: ${request.email ?? "—"}`,
    `Компания: ${request.company ?? "—"}`,
    "",
    "Комментарий:",
    request.comment ?? "—",
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return true;
}
