import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SiteSettings, SiteThemeMode } from "@shared/schema";

const siteSettingsKey = ["/api/site-settings"];

async function parseSiteSettingsResponse(res: Response): Promise<SiteSettings> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("API /api/site-settings вернул не JSON. Перезапустите сервер.");
  }
  return res.json() as Promise<SiteSettings>;
}

export function useSiteSettings(options?: { refetchInterval?: number | false }) {
  return useQuery<SiteSettings>({
    queryKey: siteSettingsKey,
    queryFn: async () => {
      const res = await fetch("/api/site-settings", { credentials: "include" });
      return parseSiteSettingsResponse(res);
    },
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useUpdateSiteThemeMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (themeMode: SiteThemeMode) => {
      const res = await apiRequest("PUT", "/api/site-settings", { themeMode });
      return parseSiteSettingsResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsKey });
    },
  });
}
