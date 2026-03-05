import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type News, type InsertNews } from "@shared/schema";

export function useNews() {
  return useQuery<News[]>({
    queryKey: ["/api/news"],
  });
}

export function useNewsItem(id: number) {
  return useQuery<News>({
    queryKey: ["/api/news", id],
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertNews) => {
      const res = await apiRequest("POST", "/api/news", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/news"] }),
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertNews> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/news/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news", variables.id] });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/news"] }),
  });
}
