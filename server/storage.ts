import { db } from "./db";
import {
  categories, brands, products, requests,
  type InsertCategory, type InsertBrand, type InsertProduct, type InsertRequest,
  type Category, type Brand, type Product, type Request
} from "@shared/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Brands
  getBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand>;
  deleteBrand(id: number): Promise<void>;

  // Products
  getProducts(params?: { categoryId?: number, brandId?: number, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Requests
  getRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: number, status: string): Promise<Request>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(brand).returning();
    return created;
  }

  async updateBrand(id: number, updates: Partial<InsertBrand>): Promise<Brand> {
    const [updated] = await db.update(brands).set(updates).where(eq(brands.id, id)).returning();
    return updated;
  }

  async deleteBrand(id: number): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  // Products
  async getProducts(params?: { categoryId?: number, brandId?: number, search?: string }): Promise<Product[]> {
    let query = db.select().from(products).$dynamic();
    
    const conditions = [];
    if (params?.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }
    if (params?.brandId) {
      conditions.push(eq(products.brandId, params.brandId));
    }
    if (params?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${params.search}%`),
          ilike(products.sku, `%${params.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Requests
  async getRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(requests.createdAt);
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [created] = await db.insert(requests).values(request).returning();
    return created;
  }

  async updateRequestStatus(id: number, status: string): Promise<Request> {
    const [updated] = await db.update(requests).set({ status }).where(eq(requests.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
