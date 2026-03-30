import { useParams, Link } from "wouter";
import { useNewsItem } from "@/hooks/use-news";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo/SeoHead";
import { CalendarDays, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/image";

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
          title="Новость не найдена | Vladopt.ru"
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
  const newsImage = item.image || "/branding/vladopt-logo-transparent.png";
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://vladopt.ru";
  const absoluteNewsImage = /^https?:\/\//i.test(newsImage)
    ? newsImage
    : `${siteOrigin}${newsImage.startsWith("/") ? newsImage : `/${newsImage}`}`;
  const newsUrl = `${siteOrigin}/news/${item.id}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(1100px_520px_at_0%_0%,rgba(37,99,235,0.10),transparent_58%),radial-gradient(950px_420px_at_100%_12%,rgba(15,23,42,0.08),transparent_60%),#f8fafc] py-10 md:py-16">
      <SeoHead
        title={`${item.title} | Vladopt.ru`}
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
            image: [absoluteNewsImage],
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> К списку новостей
        </Link>

        <article className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          <div className="relative h-[320px] md:h-[440px] w-full bg-slate-200">
            {item.image ? (
              <img
                src={getOptimizedImageUrl(item.image, "news")}
                alt={item.title}
                width={1600}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="100vw"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-slate-300" />
              </div>
            )}
          </div>

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
