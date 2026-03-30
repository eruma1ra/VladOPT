export const api = {
  categories: {
    list: { method: "GET", path: "/api/categories" },
    create: { method: "POST", path: "/api/categories" },
    update: { method: "PUT", path: "/api/categories/:id" },
    delete: { method: "DELETE", path: "/api/categories/:id" },
    deleteAll: { method: "DELETE", path: "/api/categories" },
  },
  products: {
    list: { method: "GET", path: "/api/products" },
    get: { method: "GET", path: "/api/products/:id" },
    create: { method: "POST", path: "/api/products" },
    update: { method: "PUT", path: "/api/products/:id" },
    delete: { method: "DELETE", path: "/api/products/:id" },
    deleteAll: { method: "DELETE", path: "/api/products" },
    importCsv: { method: "POST", path: "/api/products/import" },
    exportCsv: { method: "GET", path: "/api/products/export" },
  },
  requests: {
    list: { method: "GET", path: "/api/requests" },
    create: { method: "POST", path: "/api/requests" },
    updateStatus: { method: "PATCH", path: "/api/requests/:id/status" },
  },
  brands: {
    list: { method: "GET", path: "/api/brands" },
    create: { method: "POST", path: "/api/brands" },
    update: { method: "PUT", path: "/api/brands/:id" },
    delete: { method: "DELETE", path: "/api/brands/:id" },
  },
} as const;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

