import { useEffect } from "react";

const SITE_NAME = "ВладОПТ";
const DEFAULT_TITLE = "ВладОПТ - оптовые поставки материалов и инструмента для шиноремонта";
const DEFAULT_DESCRIPTION =
  "ВладОПТ - оптовый поставщик материалов и инструмента для шиноремонта. Каталог товаров, новости, контакты и запрос прайс-листа.";
const DEFAULT_IMAGE = "/branding/vladopt-logo-transparent.png";

type SeoType = "website" | "article" | "product";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export type SeoHeadProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: SeoType;
  noindex?: boolean;
  jsonLd?: JsonLdValue;
};

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeBaseUrl(raw?: string): string {
  const fallback = "https://vladopt.ru";
  const value = raw?.trim();
  if (!value) return fallback;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return fallback;
  }
}

function toAbsoluteUrl(baseUrl: string, maybeRelative: string): string {
  if (!maybeRelative) return baseUrl;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  const path = maybeRelative.startsWith("/") ? maybeRelative : `/${maybeRelative}`;
  return `${baseUrl}${path}`;
}

function ensureMetaByName(name: string): HTMLMetaElement {
  let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureMetaByProperty(property: string): HTMLMetaElement {
  let tag = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonicalLink(): HTMLLinkElement {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
}

function ensureAlternateLink(hreflang: string): HTMLLinkElement {
  let link = document.head.querySelector(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hreflang);
    document.head.appendChild(link);
  }
  return link;
}

function replaceManagedJsonLd(jsonLd?: JsonLdValue) {
  const previous = document.head.querySelectorAll('script[data-seo-managed="jsonld"]');
  previous.forEach((node) => node.remove());

  if (!jsonLd) return;

  const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const item of scripts) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-managed", "jsonld");
    script.text = JSON.stringify(item);
    document.head.appendChild(script);
  }
}

export function SeoHead({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const siteUrl = normalizeBaseUrl(import.meta.env.VITE_SITE_URL || window.location.origin);
    const currentPath = path ?? window.location.pathname;
    const canonicalUrl = /^https?:\/\//i.test(currentPath)
      ? currentPath
      : `${siteUrl}${currentPath.startsWith("/") ? currentPath : `/${currentPath}`}`;
    const resolvedTitle = cleanText(title || DEFAULT_TITLE);
    const resolvedDescription = cleanText(description || DEFAULT_DESCRIPTION);
    const resolvedImage = toAbsoluteUrl(siteUrl, image || DEFAULT_IMAGE);

    document.documentElement.lang = "ru";
    document.title = resolvedTitle;

    ensureMetaByName("description").setAttribute("content", resolvedDescription);
    ensureMetaByName("author").setAttribute("content", SITE_NAME);
    ensureMetaByName("application-name").setAttribute("content", SITE_NAME);
    const robotsContent = noindex
      ? "noindex, nofollow"
      : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
    ensureMetaByName("robots").setAttribute("content", robotsContent);
    ensureMetaByName("googlebot").setAttribute("content", robotsContent);

    ensureMetaByProperty("og:locale").setAttribute("content", "ru_RU");
    ensureMetaByProperty("og:site_name").setAttribute("content", SITE_NAME);
    ensureMetaByProperty("og:type").setAttribute("content", type);
    ensureMetaByProperty("og:title").setAttribute("content", resolvedTitle);
    ensureMetaByProperty("og:description").setAttribute("content", resolvedDescription);
    ensureMetaByProperty("og:url").setAttribute("content", canonicalUrl);
    ensureMetaByProperty("og:image").setAttribute("content", resolvedImage);

    ensureMetaByName("twitter:card").setAttribute("content", "summary_large_image");
    ensureMetaByName("twitter:title").setAttribute("content", resolvedTitle);
    ensureMetaByName("twitter:description").setAttribute("content", resolvedDescription);
    ensureMetaByName("twitter:image").setAttribute("content", resolvedImage);

    ensureCanonicalLink().setAttribute("href", canonicalUrl);
    ensureAlternateLink("ru-RU").setAttribute("href", canonicalUrl);
    ensureAlternateLink("x-default").setAttribute("href", canonicalUrl);
    replaceManagedJsonLd(jsonLd);
  }, [description, image, jsonLd, noindex, path, title, type]);

  return null;
}
