import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type HeroSlide, type InsertHeroSlide } from "@shared/schema";

const heroSlidesKey = ["/api/hero-slides"];

export function useHeroSlides(options?: { refetchInterval?: number | false }) {
  return useQuery<HeroSlide[]>({
    queryKey: heroSlidesKey,
    queryFn: async () => {
      const res = await fetch("/api/hero-slides");
      if (!res.ok) throw new Error("Failed to fetch hero slides");
      return (await res.json()) as HeroSlide[];
    },
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useCreateHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHeroSlide) => {
      const res = await apiRequest("POST", "/api/hero-slides", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroSlidesKey }),
  });
}

export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertHeroSlide> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/hero-slides/${id}`, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroSlidesKey }),
  });
}

export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/hero-slides/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroSlidesKey }),
  });
}
