import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  descriptionShort: text("description_short"),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  images: jsonb("images").$type<string[]>().default([]), // array of image URLs
  attributes: jsonb("attributes").$type<Record<string, string>>().default({}), // key-value pairs like {"diameter": "15mm", "material": "steel"}
  availability: text("availability").default('in_stock'), // 'in_stock', 'out_of_stock', 'preorder'
  isVisible: boolean("is_visible").default(true),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  comment: text("comment"),
  status: text("status").default('new').notNull(), // 'new', 'in_progress', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild"
  }),
  children: many(categories, { relationName: "parentChild" }),
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  requests: many(requests),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  product: one(products, {
    fields: [requests.productId],
    references: [products.id],
  }),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });

// Exports types
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Request = typeof requests.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

// API Contract Types
export type CategoryResponse = Category & { children?: Category[] };
export type ProductResponse = Product & { category?: Category, brand?: Brand };
export type RequestResponse = Request & { product?: Product };

export type ProductQueryParams = {
  categoryId?: number;
  brandId?: number;
  search?: string;
  availability?: string;
};
