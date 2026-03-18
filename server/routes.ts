import type { Express } from "express";
import type { Server } from "http";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  insertRequestSchema,
  insertNewsSchema,
  insertHeroSlideSchema,
  siteThemeModeSchema,
  type InsertProduct,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { setupAuth, registerAuthRoutes, isAdmin } from "./replit_integrations/auth";
import { sendRequestNotificationByEmail } from "./services/request-notifier";

const csvUpload = multer({ storage: multer.memoryStorage() });
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const imageMimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const productCsvColumns = {
  code: 0,
  group: 4,
  sku: 12,
  name: 14,
  quantity: 15,
} as const;

const productCsvWidth = 16;

function readCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\u00A0/g, " ").trim();
}

function normalizeCategoryName(value: string): string {
  return value
    .replace(/^\d+\s*[-.)]?\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "category";
}

function parseQuantity(value: string): number | null {
  if (!value) return null;

  const compact = value.replace(/\s+/g, "");
  if (!compact) return null;

  const normalized = /^-?\d{1,3}(,\d{3})+$/.test(compact)
    ? compact.replace(/,/g, "")
    : compact.replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getAvailabilityFromQuantity(quantity: number | null): "in_stock" | "out_of_stock" {
  return quantity !== null && quantity > 0 ? "in_stock" : "out_of_stock";
}

function emptyProductCsvRow(): string[] {
  return Array.from({ length: productCsvWidth }, () => "");
}

function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post(api.categories.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const category = await storage.createCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.categories.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.categories.update.input.parse(req.body);
      const category = await storage.updateCategory(Number(req.params.id), input);
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.categories.delete.path, isAdmin, async (req, res) => {
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).send();
  });

  app.delete(api.categories.deleteAll.path, isAdmin, async (_req, res) => {
    const deleted = await storage.deleteAllCategories();
    res.json({ message: "Все категории удалены", deleted });
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    
    const products = await storage.getProducts({ categoryId, search });
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next();
    }

    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, isAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  app.delete(api.products.deleteAll.path, isAdmin, async (_req, res) => {
    const deleted = await storage.deleteAllProducts();
    res.json({ message: "Все товары удалены", deleted });
  });

  // Export CSV
  app.get(api.products.exportCsv.path, isAdmin, async (req, res) => {
    const products = await storage.getProducts();
    const dateLabel = new Date().toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const titleRow = emptyProductCsvRow();
    titleRow[0] = `Прайс-лист на ${dateLabel} г.`;

    const spacerRow = emptyProductCsvRow();

    const headerRow = emptyProductCsvRow();
    headerRow[productCsvColumns.code] = "Код";
    headerRow[productCsvColumns.group] = "Группа";
    headerRow[productCsvColumns.sku] = "Артикул";
    headerRow[productCsvColumns.name] = "Номенклатура";
    headerRow[productCsvColumns.quantity] = "Склад Владивосток";

    const subHeaderRow = emptyProductCsvRow();
    subHeaderRow[productCsvColumns.quantity] = "Остаток";

    const csvRows: string[][] = [titleRow, spacerRow, headerRow, subHeaderRow];

    for (const p of products) {
      const attributes = (p.attributes ?? {}) as Record<string, unknown>;
      const code = readCsvCell(attributes["Код"]) || p.sku;
      const groupFromAttributes = normalizeCategoryName(readCsvCell(attributes["Группа"]));
      const groupFromCategory = normalizeCategoryName(p.category?.name ?? "");
      const group = groupFromAttributes || groupFromCategory;
      const quantity =
        readCsvCell(attributes["Остаток"]) || (p.availability === "in_stock" ? "1" : "0");

      const row = emptyProductCsvRow();
      row[productCsvColumns.code] = code;
      row[productCsvColumns.group] = group;
      row[productCsvColumns.sku] = p.sku;
      row[productCsvColumns.name] = p.name;
      row[productCsvColumns.quantity] = quantity;

      csvRows.push(row);
    }

    const csvContent = csvRows
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=products-template.csv");
    res.status(200).send(`\uFEFF${csvContent}`);
  });

  // CSV Import
  app.post(api.products.importCsv.path, isAdmin, csvUpload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const records = parse(req.file.buffer.toString(), {
        columns: false,
        skip_empty_lines: false,
        relax_column_count: true,
        bom: true,
      });

      let imported = 0;
      let updated = 0;
      const errors: string[] = [];
      const existingCategories = await storage.getCategories();
      const categoryByKey = new Map<string, number>();
      const usedSlugs = new Set<string>();

      for (const category of existingCategories) {
        categoryByKey.set(normalizeKey(category.name), category.id);
        categoryByKey.set(normalizeKey(normalizeCategoryName(category.name)), category.id);
        usedSlugs.add(category.slug);
      }

      const resolveCategoryId = async (groupRaw: string): Promise<number | null> => {
        const categoryName = normalizeCategoryName(groupRaw);
        if (!categoryName) return null;

        const key = normalizeKey(categoryName);
        const fromMap = categoryByKey.get(key);
        if (fromMap) return fromMap;

        const baseSlug = slugify(categoryName);
        let slug = baseSlug;
        let suffix = 2;

        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix++;
        }

        const created = await storage.createCategory({ name: categoryName, slug });
        categoryByKey.set(key, created.id);
        usedSlugs.add(created.slug);
        return created.id;
      };

      for (let i = 0; i < records.length; i++) {
        const row = records[i] as unknown[];
        try {
          const sku = readCsvCell(row[productCsvColumns.sku]);
          const name = readCsvCell(row[productCsvColumns.name]);

          if (!sku && !name) {
            continue;
          }

          const isHeaderRow =
            sku.toLowerCase() === "артикул" || name.toLowerCase() === "номенклатура";
          if (isHeaderRow) {
            continue;
          }

          if (!sku) {
            errors.push(`Строка ${i + 1}: не заполнен Артикул`);
            continue;
          }

          const quantityRaw = readCsvCell(row[productCsvColumns.quantity]);
          const quantity = parseQuantity(quantityRaw);
          const availability = getAvailabilityFromQuantity(quantity);

          const existingProduct = await storage.getProductBySku(sku);
          if (existingProduct) {
            const existingAttributes =
              (existingProduct.attributes ?? {}) as Record<string, unknown>;
            await storage.updateProduct(existingProduct.id, {
              availability,
              attributes: {
                ...existingAttributes,
                "Остаток": quantityRaw || "0",
              },
            });
            updated++;
          } else {
            if (!name) {
              errors.push(`Строка ${i + 1}: для нового товара не заполнена Номенклатура`);
              continue;
            }

            const code = readCsvCell(row[productCsvColumns.code]);
            const groupRaw = readCsvCell(row[productCsvColumns.group]);
            const normalizedGroup = normalizeCategoryName(groupRaw);
            const categoryId = await resolveCategoryId(groupRaw);

            const importedAttributes: Record<string, unknown> = {};
            if (code) importedAttributes["Код"] = code;
            if (normalizedGroup) importedAttributes["Группа"] = normalizedGroup;
            importedAttributes["Остаток"] = quantityRaw || "0";

            const newProduct: InsertProduct = {
              sku,
              name,
              descriptionShort: null,
              categoryId,
              brandId: null,
              images: [],
              attributes: importedAttributes,
              availability,
            };

            await storage.createProduct(newProduct);
            imported++;
          }
        } catch (e: any) {
          errors.push(`Строка ${i + 1}: ${e.message}`);
        }
      }

      res.json({ message: "Импорт завершен", imported, updated, errors });
    } catch (e: any) {
      res.status(400).json({ message: `Ошибка чтения CSV: ${e.message}` });
    }
  });

  // Image Upload (admin)
  app.post("/api/uploads/image", isAdmin, (req, res) => {
    imageUpload.single("file")(req, res, async (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Файл слишком большой. Максимум 8 МБ." });
        }
        return res.status(400).json({ message: "Не удалось загрузить файл." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Файл не передан." });
      }

      try {
        const extension = imageMimeToExtension[req.file.mimetype];
        if (!extension) {
          return res.status(400).json({ message: "Допустимы только JPG, JPEG, PNG или WEBP." });
        }

        const uploadsDir = path.resolve(process.cwd(), "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const fileName = `${Date.now()}-${randomUUID()}${extension}`;
        const targetPath = path.join(uploadsDir, fileName);

        await fs.writeFile(targetPath, req.file.buffer);
        return res.status(201).json({ url: `/uploads/${fileName}` });
      } catch (writeError) {
        console.error("Image upload save error:", writeError);
        return res.status(500).json({ message: "Не удалось сохранить файл." });
      }
    });
  });

  // Requests
  app.get(api.requests.list.path, isAdmin, async (req, res) => {
    const requests = await storage.getRequests();
    res.json(requests);
  });

  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = insertRequestSchema.parse(req.body);
      const request = await storage.createRequest(input);

      let productPreview: { name: string; sku: string } | null = null;
      if (request.productId) {
        const product = await storage.getProduct(request.productId);
        if (product) {
          productPreview = { name: product.name, sku: product.sku };
        }
      }

      sendRequestNotificationByEmail({ request, product: productPreview }).catch((emailErr) => {
        console.error("Request notification email error:", emailErr);
      });

      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Create request error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.requests.updateStatus.path, isAdmin, async (req, res) => {
    try {
      const { status } = api.requests.updateStatus.input.parse(req.body);
      const request = await storage.updateRequestStatus(Number(req.params.id), status);
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/requests/:id", isAdmin, async (req, res) => {
    await storage.deleteRequest(Number(req.params.id));
    res.status(204).send();
  });

  // News
  app.get("/api/news", async (req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.get("/api/news/:id", async (req, res) => {
    const item = await storage.getNewsItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "News not found" });
    res.json(item);
  });

  app.post("/api/news", isAdmin, async (req, res) => {
    try {
      const input = insertNewsSchema.parse(req.body);
      const item = await storage.createNews(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/news/:id", isAdmin, async (req, res) => {
    try {
      const input = insertNewsSchema.partial().parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ message: "Нет данных для обновления" });
      }
      const item = await storage.updateNews(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/news/:id/feature", isAdmin, async (req, res) => {
    try {
      const input = z.object({ isFeatured: z.boolean() }).parse(req.body);
      const item = await storage.setNewsFeatured(Number(req.params.id), input.isFeatured);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/news/:id", isAdmin, async (req, res) => {
    await storage.deleteNews(Number(req.params.id));
    res.status(204).send();
  });

  // Hero Slides
  app.get("/api/hero-slides", async (_req, res) => {
    const slides = await storage.getHeroSlides();
    res.json(slides);
  });

  app.post("/api/hero-slides", isAdmin, async (req, res) => {
    try {
      const input = insertHeroSlideSchema.parse(req.body);
      const slide = await storage.createHeroSlide(input);
      res.status(201).json(slide);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/hero-slides/:id", isAdmin, async (req, res) => {
    try {
      const input = insertHeroSlideSchema.partial().parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ message: "Нет данных для обновления" });
      }
      const slide = await storage.updateHeroSlide(Number(req.params.id), input);
      res.json(slide);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/hero-slides/:id", isAdmin, async (req, res) => {
    await storage.deleteHeroSlide(Number(req.params.id));
    res.status(204).send();
  });

  // Site settings
  app.get("/api/site-settings", async (_req, res) => {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  });

  app.put("/api/site-settings", isAdmin, async (req, res) => {
    try {
      const { themeMode } = z.object({ themeMode: siteThemeModeSchema }).parse(req.body);
      const updated = await storage.updateSiteThemeMode(themeMode);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
