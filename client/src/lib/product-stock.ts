const stockAttributeKeys = ["Остаток", "quantity", "qty", "stock"];

function parseStockValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const compact = String(value).replace(/\u00A0/g, " ").replace(/\s+/g, "");
  if (!compact) return null;

  const normalized = /^-?\d{1,3}(,\d{3})+$/.test(compact)
    ? compact.replace(/,/g, "")
    : compact.replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getProductStockQuantity(attributes: unknown): number | null {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return null;

  const source = attributes as Record<string, unknown>;
  for (const key of stockAttributeKeys) {
    const value = parseStockValue(source[key]);
    if (value !== null) return value;
  }

  return null;
}

export function formatProductStockQuantity(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
