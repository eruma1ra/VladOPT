import { users, type User, type InsertUser, categories, type Category, type InsertCategory, products, type Product, type InsertProduct, requests, type Request, type InsertRequest, brands, type Brand, type InsertBrand, news, type News, type InsertNews } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, and, desc, ne } from "drizzle-orm";
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
  deleteAllCategories(): Promise<number>;

  // Products
  getProducts(filter?: { categoryId?: number; search?: string }): Promise<(Product & { category: Category | null })[]>;
  getProduct(id: number): Promise<(Product & { category: Category | null }) | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  deleteAllProducts(): Promise<number>;

  // Requests
  getRequests(): Promise<(Request & { product: Product | null })[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: number, status: string): Promise<Request>;
  deleteRequest(id: number): Promise<void>;

  // News
  getNews(): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, news: Partial<InsertNews>): Promise<News>;
  setNewsFeatured(id: number, isFeatured: boolean): Promise<News>;
  deleteNews(id: number): Promise<void>;

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
    // First, null out references in products
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
    // Then delete the category
    await db.delete(categories).where(eq(categories.id, id));
  }

  async deleteAllCategories(): Promise<number> {
    await db.update(products).set({ categoryId: null });
    const deleted = await db.delete(categories).returning({ id: categories.id });
    return deleted.length;
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

  async deleteAllProducts(): Promise<number> {
    await db.update(requests).set({ productId: null });
    const deleted = await db.delete(products).returning({ id: products.id });
    return deleted.length;
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
    const values = {
      ...insertRequest,
      email: insertRequest.email.trim(),
    };
    const [request] = await db.insert(requests).values(values).returning();
    return request;
  }

  async updateRequestStatus(id: number, status: string): Promise<Request> {
    const [updated] = await db.update(requests).set({ status }).where(eq(requests.id, id)).returning();
    return updated;
  }

  async deleteRequest(id: number): Promise<void> {
    await db.delete(requests).where(eq(requests.id, id));
  }

  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.isFeatured), desc(news.createdAt));
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    const [item] = await db.select().from(news).where(eq(news.id, id));
    return item;
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    return await db.transaction(async (tx) => {
      if (insertNews.isFeatured) {
        await tx.update(news).set({ isFeatured: false });
      }

      const [item] = await tx.insert(news).values(insertNews).returning();
      return item;
    });
  }

  async updateNews(id: number, newsData: Partial<InsertNews>): Promise<News> {
    const entries = Object.entries(newsData).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      const [existing] = await db.select().from(news).where(eq(news.id, id));
      if (!existing) {
        throw new Error("News not found");
      }
      return existing;
    }

    const sanitizedData = Object.fromEntries(entries) as Partial<InsertNews>;

    return await db.transaction(async (tx) => {
      if (sanitizedData.isFeatured === true) {
        await tx
          .update(news)
          .set({ isFeatured: false })
          .where(and(eq(news.isFeatured, true), ne(news.id, id)));
      }

      const [updated] = await tx.update(news).set(sanitizedData).where(eq(news.id, id)).returning();
      if (!updated) {
        throw new Error("News not found");
      }
      return updated;
    });
  }

  async setNewsFeatured(id: number, isFeatured: boolean): Promise<News> {
    return await db.transaction(async (tx) => {
      if (isFeatured) {
        await tx
          .update(news)
          .set({ isFeatured: false })
          .where(and(eq(news.isFeatured, true), ne(news.id, id)));
      }

      const [updated] = await tx
        .update(news)
        .set({ isFeatured })
        .where(eq(news.id, id))
        .returning();

      if (!updated) {
        throw new Error("News not found");
      }
      return updated;
    });
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }
}

export const storage = new DatabaseStorage();
