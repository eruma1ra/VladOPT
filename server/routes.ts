import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

const upload = multer({ storage: multer.memoryStorage() });

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

  app.post(api.categories.create.path, isAuthenticated, async (req, res) => {
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

  app.put(api.categories.update.path, isAuthenticated, async (req, res) => {
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

  app.delete(api.categories.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).send();
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    
    const products = await storage.getProducts({ categoryId, search });
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
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

  app.put(api.products.update.path, isAuthenticated, async (req, res) => {
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

  app.delete(api.products.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // Export CSV
  app.get(api.products.exportCsv.path, isAuthenticated, async (req, res) => {
    const products = await storage.getProducts();
    const csvRows = [
      ["sku", "name", "description_short", "images", "attributes", "availability"].join(",")
    ];

    for (const p of products) {
      csvRows.push([
        `"${p.sku}"`,
        `"${p.name}"`,
        `"${p.descriptionShort || ''}"`,
        `"${(p.images as string[]).join(',')}"`,
        `'${JSON.stringify(p.attributes)}'`,
        `"${p.availability}"`
      ].join(","));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csvRows.join("\n"));
  });

  // CSV Import
  app.post(api.products.importCsv.path, isAuthenticated, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const records = parse(req.file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true
      });

      let imported = 0;
      let updated = 0;
      const errors: string[] = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        try {
          if (!row.sku || !row.name) {
            errors.push(`Row ${i + 1}: Missing required fields sku or name`);
            continue;
          }

          let attributes = {};
          try {
            if (row.attributes) attributes = JSON.parse(row.attributes);
          } catch (e) {
            // keep as empty object if not valid JSON
          }

          const productData = {
            sku: row.sku,
            name: row.name,
            descriptionShort: row.description_short || null,
            images: row.images ? row.images.split(',').map((s: string) => s.trim()) : [],
            attributes,
            availability: row.availability || 'in_stock'
          };

          const existingProduct = await storage.getProductBySku(row.sku);
          if (existingProduct) {
            await storage.updateProduct(existingProduct.id, productData);
            updated++;
          } else {
            await storage.createProduct(productData);
            imported++;
          }
        } catch (e: any) {
          errors.push(`Row ${i + 1} (${row.sku}): ${e.message}`);
        }
      }

      res.json({ message: "Import completed", imported, updated, errors });
    } catch (e: any) {
      res.status(400).json({ message: `CSV parsing error: ${e.message}` });
    }
  });

  // Requests
  app.get(api.requests.list.path, isAuthenticated, async (req, res) => {
    const requests = await storage.getRequests();
    res.json(requests);
  });

  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = api.requests.create.input.parse(req.body);
      const request = await storage.createRequest(input);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.requests.updateStatus.path, isAuthenticated, async (req, res) => {
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

  return httpServer;
}
