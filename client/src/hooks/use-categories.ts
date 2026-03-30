import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@/lib/api";
import { type Category, type InsertCategory } from "@shared/schema";

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return (await res.json()) as Category[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await fetch(api.categories.create.path, {
        method: api.categories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create category");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertCategory> & { id: number }) => {
      const url = buildUrl(api.categories.update.path, { id });
      const res = await fetch(url, {
        method: api.categories.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update category");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.categories.delete.path, { id });
      const res = await fetch(url, {
        method: api.categories.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

export function useDeleteAllCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.categories.deleteAll.path, {
        method: api.categories.deleteAll.method,
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to delete all categories";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}
