import { z } from 'zod';
import { insertCategorySchema, categories, insertProductSchema, products, insertRequestSchema, requests } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: { 200: z.array(z.any()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: { 201: z.custom<typeof categories.$inferSelect>(), 400: errorSchemas.validation, 401: errorSchemas.unauthorized },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema.partial(),
      responses: { 200: z.custom<typeof categories.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    deleteAll: {
      method: 'DELETE' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.object({ message: z.string(), deleted: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        categoryId: z.coerce.number().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: { 200: z.array(z.any()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>(), 400: errorSchemas.validation, 401: errorSchemas.unauthorized },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: { 200: z.custom<typeof products.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    deleteAll: {
      method: 'DELETE' as const,
      path: '/api/products' as const,
      responses: {
        200: z.object({ message: z.string(), deleted: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
    importCsv: {
      method: 'POST' as const,
      path: '/api/products/import' as const,
      responses: { 200: z.object({ message: z.string(), imported: z.number(), updated: z.number(), errors: z.array(z.string()) }), 400: errorSchemas.validation, 401: errorSchemas.unauthorized },
    },
    exportCsv: {
      method: 'GET' as const,
      path: '/api/products/export' as const,
      responses: { 200: z.any(), 401: errorSchemas.unauthorized },
    }
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests' as const,
      responses: { 200: z.array(z.any()), 401: errorSchemas.unauthorized },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests' as const,
      input: insertRequestSchema,
      responses: { 201: z.custom<typeof requests.$inferSelect>(), 400: errorSchemas.validation },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/requests/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof requests.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
