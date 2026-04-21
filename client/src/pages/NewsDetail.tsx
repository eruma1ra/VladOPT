import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { createPortal } from "react-dom";
import { useNewsItem } from "@/hooks/use-news";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo/SeoHead";
import { CalendarDays, Loader2, Image as ImageIcon, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/image";
import { getNewsImages, getPrimaryNewsImage } from "@/lib/news";

function formatNewsDate(value: Date | string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status === "limited_offer") return "Спецпредложение";
  if (status === "active") return "Новость";
  return "Архив";
}

function statusClass(status: string) {
  if (status === "limited_offer") {
    return "rounded-full border-none bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.15em]";
  }

  return "rounded-full border border-slate-200 bg-white text-slate-700 text-[10px] font-bold uppercase tracking-[0.15em]";
}

export default function NewsDetail() {
  const { id } = useParams();
  const newsId = Number(id);
  const { data: item, isLoading } = useNewsItem(newsId);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const imageList = getNewsImages(item);
  const activeImage = imageList[activeImageIdx] ?? null;

  useEffect(() => {
    setActiveImageIdx(0);
    setIsViewerOpen(false);
  }, [item?.id]);

  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }
      if (event.key === "ArrowLeft" && imageList.length > 1) {
        setActiveImageIdx((current) => (current - 1 + imageList.length) % imageList.length);
      }
      if (event.key === "ArrowRight" && imageList.length > 1) {
        setActiveImageIdx((current) => (current + 1) % imageList.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [imageList.length, isViewerOpen]);

  const goPrevImage = () => {
    if (imageList.length <= 1) return;
    setActiveImageIdx((current) => (current - 1 + imageList.length) % imageList.length);
  };

  const goNextImage = () => {
    if (imageList.length <= 1) return;
    setActiveImageIdx((current) => (current + 1) % imageList.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <SeoHead
          title="Новость не найдена | ВладОПТ"
          description="Запрошенная новость не найдена."
          path={`/news/${newsId || ""}`}
          type="article"
          noindex
        />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Новость не найдена</h2>
        <Link href="/news">
          <Button className="border-none mt-4">Вернуться к новостям</Button>
        </Link>
      </div>
    );
  }

  const newsDescription = item.content.replace(/\s+/g, " ").trim().slice(0, 180);
  const newsImage = getPrimaryNewsImage(item) || "/branding/vladopt-logo-transparent.png";
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://vladopt.ru";
  const toAbsolute = (value: string) =>
    /^https?:\/\//i.test(value) ? value : `${siteOrigin}${value.startsWith("/") ? value : `/${value}`}`;
  const schemaImages = (imageList.length > 0 ? imageList : [newsImage]).map(toAbsolute);
  const newsUrl = `${siteOrigin}/news/${item.id}`;

  const fullscreenViewer =
    isViewerOpen && activeImage
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-3 md:p-6"
            onClick={() => setIsViewerOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-5 md:top-5"
              aria-label="Закрыть просмотр"
            >
              ✕
            </button>

            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrevImage();
                  }}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-5"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNextImage();
                  }}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-5"
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <img
              src={activeImage}
              alt={`${item.title} ${activeImageIdx + 1}`}
              width={1800}
              height={1350}
              className="max-h-[92vh] max-w-[94vw] object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(1100px_520px_at_0%_0%,rgba(37,99,235,0.10),transparent_58%),radial-gradient(950px_420px_at_100%_12%,rgba(15,23,42,0.08),transparent_60%),#f8fafc] py-10 md:py-16">
      <SeoHead
        title={`${item.title} | ВладОПТ`}
        description={newsDescription || "Новость компании ВладОПТ."}
        path={`/news/${item.id}`}
        type="article"
        image={newsImage}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: item.title,
            datePublished: new Date(item.createdAt).toISOString(),
            dateModified: new Date(item.createdAt).toISOString(),
            image: schemaImages,
            author: {
              "@type": "Organization",
              name: "ВладОПТ",
            },
            publisher: {
              "@type": "Organization",
              name: "ВладОПТ",
              logo: {
                "@type": "ImageObject",
                url: `${siteOrigin}/branding/vladopt-logo-transparent.png`,
              },
            },
            mainEntityOfPage: newsUrl,
            articleBody: item.content,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Главная",
                item: siteOrigin,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Новости",
                item: `${siteOrigin}/news`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: item.title,
                item: newsUrl,
              },
            ],
          },
        ]}
      />
      {fullscreenViewer}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> К списку новостей
        </Link>

        <article className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-200 bg-white p-5 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {item.isFeatured ? (
                <Badge className="rounded-full border-none bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                  Важная информация
                </Badge>
              ) : null}
              <Badge className={statusClass(item.status)}>{statusLabel(item.status)}</Badge>
            </div>

            <h1 className="mt-4 text-2xl md:text-4xl font-display font-bold leading-tight text-slate-900 max-w-4xl">
              {item.title}
            </h1>

            <div className="mt-4 inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
              <CalendarDays className="w-4 h-4" />
              {formatNewsDate(item.createdAt)}
            </div>
          </div>

          <section className="border-b border-slate-200 bg-slate-50/60 p-5 md:p-8">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <div className="aspect-[4/3] w-full">
                  {activeImage ? (
                    <button
                      type="button"
                      className="block h-full w-full"
                      onClick={() => setIsViewerOpen(true)}
                    >
                      <img
                        src={getOptimizedImageUrl(activeImage, "news")}
                        alt={item.title}
                        width={1400}
                        height={1050}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        sizes="(max-width: 1280px) 100vw, 1200px"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <ImageIcon className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                </div>

                {imageList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition-colors hover:bg-white"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition-colors hover:bg-white"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {imageList.length > 1 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {imageList.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIdx(index)}
                      aria-label={`Показать фото ${index + 1}`}
                      className={`overflow-hidden rounded-xl bg-slate-100 transition-all ${
                        activeImageIdx === index
                          ? "ring-2 ring-primary/70"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getOptimizedImageUrl(imageUrl, "thumb")}
                        alt={`${item.title} ${index + 1}`}
                        width={240}
                        height={180}
                        loading="lazy"
                        decoding="async"
                        sizes="120px"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-5 md:p-8">
            <div className="text-slate-700 text-[1.02rem] leading-relaxed whitespace-pre-wrap break-words">
              {item.content}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
