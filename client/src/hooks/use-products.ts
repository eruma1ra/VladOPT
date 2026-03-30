import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@/lib/api";
import { type Product, type InsertProduct, type ProductQueryParams } from "@shared/schema";

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: [api.products.list.path, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
      if (params?.brandId) searchParams.set("brandId", params.brandId.toString());
      if (params?.search) searchParams.set("search", params.search);
      
      const url = `${api.products.list.path}?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return (await res.json()) as (Product & { category?: any, brand?: any })[];
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      if (!id || isNaN(id)) return null;
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return (await res.json()) as (Product & { category?: any, brand?: any });
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertProduct> & { id: number }) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: api.products.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to update product";
        try {
          const payload = await res.json();
          if (payload?.message) message = payload.message;
        } catch {
          // keep fallback message
        }
        throw new Error(message);
      }
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetch(url, {
        method: api.products.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useDeleteAllProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.products.deleteAll.path, {
        method: api.products.deleteAll.method,
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to delete all products";
        try {
          const payload = await res.json();
          if (payload?.message) message = payload.message;
        } catch {
          // ignore parsing errors and keep fallback message
        }
        throw new Error(message);
      }
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useImportProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.products.importCsv.path, {
        method: api.products.importCsv.method,
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to import products";
        try {
          const payload = await res.json();
          if (payload?.message) message = payload.message;
        } catch {
          // ignore parsing errors and keep fallback message
        }
        throw new Error(message);
      }
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}
