export type UploadImagePreset = "card" | "thumb" | "detail" | "hero" | "news";

function parsePathname(value: string): string {
  const normalized = value.trim();
  if (!normalized) return normalized;
  if (/^https?:\/\//i.test(normalized)) {
    try {
      return new URL(normalized).pathname;
    } catch {
      return normalized;
    }
  }
  return normalized.split("?")[0] ?? normalized;
}

export function getOptimizedImageUrl(source: string | null | undefined, preset: UploadImagePreset): string {
  if (!source) return "";

  const pathname = parsePathname(source);
  if (!pathname.startsWith("/uploads/")) {
    return source;
  }

  const fileName = pathname.replace(/^\/uploads\//, "");
  if (!fileName) return source;

  return `/media/uploads/${preset}/${encodeURIComponent(fileName)}`;
}
