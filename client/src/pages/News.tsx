import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";
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
    return "rounded-full border-none bg-orange-500 text-white text-[10px] font-bold uppercase tracking-[0.15em]";
  }

  return "rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-[0.15em]";
}

export default function News() {
  const { data: newsItems, isLoading } = useNews();

  const activeNews = useMemo(
    () => (newsItems?.filter((item) => item.status !== "archived") ?? []),
    [newsItems]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_0%_0%,rgba(37,99,235,0.10),transparent_60%),radial-gradient(1000px_450px_at_100%_10%,rgba(15,23,42,0.07),transparent_60%),#f8fafc] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-14">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-[1.05] max-w-4xl">
            Новости компании и информация о товаре
          </h1>
          <p className="mt-5 text-slate-600 text-lg max-w-2xl leading-relaxed">
            Поступления, акции, изменения по каталогу и другая информация о товаре.
          </p>
        </div>

        {activeNews.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7">
            {activeNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="block h-full">
                <Card
                  className="group h-full overflow-hidden border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
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
                    <p className="text-slate-600 leading-relaxed line-clamp-4 text-sm">{item.content}</p>

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
          <Card className="border-dashed border-slate-300 bg-white/80">
            <CardContent className="py-20 text-center">
              <p className="text-slate-500 text-lg">Новости скоро появятся. Сейчас раздел на обновлении.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
