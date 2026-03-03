import { users, type User, type InsertUser, categories, type Category, type InsertCategory, products, type Product, type InsertProduct, requests, type Request, type InsertRequest, brands, type Brand, type InsertBrand } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Products
  getProducts(filter?: { categoryId?: number; search?: string }): Promise<(Product & { category: Category | null })[]>;
  getProduct(id: number): Promise<(Product & { category: Category | null }) | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Requests
  getRequests(): Promise<(Request & { product: Product | null })[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: number, status: string): Promise<Request>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getProducts(filter?: { categoryId?: number; search?: string }): Promise<(Product & { category: Category | null })[]> {
    const allProducts = await db.query.products.findMany({
      with: {
        category: true,
      },
      where: (products, { and, eq, ilike, or }) => {
        const conditions = [];
        if (filter?.categoryId) {
          conditions.push(eq(products.categoryId, filter.categoryId));
        }
        if (filter?.search) {
          conditions.push(
            or(
              ilike(products.name, `%${filter.search}%`),
              ilike(products.sku, `%${filter.search}%`)
            )
          );
        }
        return conditions.length > 0 ? and(...conditions) : undefined;
      }
    });

    return allProducts as (Product & { category: Category | null })[];
  }

  async getProduct(id: number): Promise<(Product & { category: Category | null }) | undefined> {
    const [product] = await db.query.products.findMany({
      where: eq(products.id, id),
      with: {
        category: true,
      }
    });
    return product as (Product & { category: Category | null }) | undefined;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getRequests(): Promise<(Request & { product: Product | null })[]> {
    return await db.query.requests.findMany({
      with: {
        product: true
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)]
    }) as (Request & { product: Product | null })[];
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const [request] = await db.insert(requests).values(insertRequest).returning();
    return request;
  }

  async updateRequestStatus(id: number, status: string): Promise<Request> {
    const [updated] = await db.update(requests).set({ status }).where(eq(requests.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
