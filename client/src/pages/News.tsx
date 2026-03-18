import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Image as ImageIcon, Loader2, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNews } from "@/hooks/use-news";

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

function statusBadgeClass(status: string) {
  if (status === "limited_offer") {
    return "rounded-full border-none bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.15em]";
  }

  return "rounded-full border border-slate-200 bg-white text-slate-700 text-[10px] font-bold uppercase tracking-[0.15em]";
}

function excerpt(text: string, max = 170) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}...`;
}

export default function News() {
  const { data: newsItems, isLoading } = useNews();

  const activeNews = useMemo(() => {
    const items = newsItems?.filter((item) => item.status !== "archived") ?? [];
    return [...items].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return Number(b.isFeatured) - Number(a.isFeatured);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [newsItems]);

  const featuredNews = useMemo(
    () => activeNews.find((item) => item.isFeatured) ?? activeNews[0] ?? null,
    [activeNews]
  );

  const gridNews = useMemo(
    () => activeNews.filter((item) => item.id !== featuredNews?.id),
    [activeNews, featuredNews]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_0%_0%,rgba(37,99,235,0.12),transparent_60%),radial-gradient(900px_420px_at_100%_12%,rgba(15,23,42,0.08),transparent_60%),#f8fafc] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/85 backdrop-blur-md p-7 md:p-10 mb-8 shadow-xl shadow-slate-200/40">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Newspaper className="w-3.5 h-3.5" />
              Раздел новостей
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-[1.02] max-w-4xl">
              Новости компании и информация о товаре
            </h1>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl leading-relaxed">
              Поступления, акции, изменения по каталогу и другая информация о товаре.
            </p>
          </div>
        </section>

        {featuredNews ? (
          <section className="mb-8">
            <Link href={`/news/${featuredNews.id}`} className="block">
              <Card className="group overflow-hidden border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="grid lg:grid-cols-[1.15fr_1fr]">
                  <div className="relative min-h-[300px] md:min-h-[380px] lg:min-h-[420px]">
                    {featuredNews.image ? (
                      <img
                        src={featuredNews.image}
                        alt={featuredNews.title}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/20 via-transparent to-primary/10" />
                  </div>

                  <CardContent className="p-6 md:p-8 lg:p-10 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border-none bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                        Важная информация
                      </Badge>
                      <Badge className={statusBadgeClass(featuredNews.status)}>{statusLabel(featuredNews.status)}</Badge>
                    </div>

                    <h2 className="mt-6 text-2xl md:text-3xl lg:text-4xl font-display font-bold text-slate-900 leading-tight">
                      {featuredNews.title}
                    </h2>

                    <p className="mt-4 text-slate-600 leading-relaxed text-[15px] md:text-base">
                      {excerpt(featuredNews.content, 300)}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <CalendarDays className="w-4 h-4" />
                      {formatNewsDate(featuredNews.createdAt)}
                    </div>

                    <div className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Читать полностью
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </section>
        ) : null}

        {gridNews.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7">
            {gridNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="block h-full">
                <Card className="group h-full overflow-hidden rounded-[24px] border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-52">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/35 to-transparent" />
                  </div>

                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {item.isFeatured ? (
                        <Badge className="rounded-full border-none bg-primary text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                          На переднем плане
                        </Badge>
                      ) : null}
                      <Badge className={statusBadgeClass(item.status)}>{statusLabel(item.status)}</Badge>
                      <span className="ml-auto text-xs text-slate-500">{formatNewsDate(item.createdAt)}</span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-slate-900 leading-tight mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed line-clamp-4 text-sm">{excerpt(item.content, 170)}</p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Подробнее
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}

        {activeNews.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/90">
            <CardContent className="py-20 text-center">
              <p className="text-slate-500 text-lg">Новости скоро появятся. Сейчас раздел на обновлении.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
