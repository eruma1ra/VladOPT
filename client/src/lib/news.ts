type NewsImageSource = {
  image?: string | null;
  images?: unknown;
};

export function getNewsImages(source: NewsImageSource | null | undefined): string[] {
  if (!source) return [];

  const imageList = Array.isArray(source.images)
    ? source.images.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim())
    : [];
  const fallbackImage = typeof source.image === "string" && source.image.trim().length > 0 ? source.image.trim() : null;

  if (fallbackImage && !imageList.includes(fallbackImage)) {
    return [fallbackImage, ...imageList];
  }

  return imageList;
}

export function getPrimaryNewsImage(source: NewsImageSource | null | undefined): string | null {
  return getNewsImages(source)[0] ?? null;
}

export function moveListItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
