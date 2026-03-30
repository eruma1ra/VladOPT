import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@/lib/api";
import { type Brand, type InsertBrand } from "@shared/schema";

export function useBrands() {
  return useQuery({
    queryKey: [api.brands.list.path],
    queryFn: async () => {
      const res = await fetch(api.brands.list.path);
      if (!res.ok) throw new Error("Failed to fetch brands");
      return (await res.json()) as Brand[];
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBrand) => {
      const res = await fetch(api.brands.create.path, {
        method: api.brands.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create brand");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brands.list.path] }),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertBrand> & { id: number }) => {
      const url = buildUrl(api.brands.update.path, { id });
      const res = await fetch(url, {
        method: api.brands.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update brand");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brands.list.path] }),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.brands.delete.path, { id });
      const res = await fetch(url, {
        method: api.brands.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete brand");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brands.list.path] }),
  });
}
