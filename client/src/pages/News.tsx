import { useNews } from "@/hooks/use-news";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function News() {
  const { data: newsItems, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeNews = newsItems?.filter(item => item.status !== 'archived') || [];

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Новости компании</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Будьте в курсе последних событий, поступлений товара и специальных предложений ВладОПТ.</p>
        </div>

        <div className="space-y-8">
          {activeNews.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/3 h-64 md:h-auto overflow-hidden bg-slate-200">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    {item.status === 'limited_offer' && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-white font-bold py-1 px-3 shadow-lg">
                          Предложение
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-8 flex-grow flex flex-col justify-center">
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(item.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-slate-600 text-base leading-relaxed line-clamp-3 mb-6">
                      {item.content}
                    </p>
                    <div className="mt-auto flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                      Читать далее <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
          {activeNews.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 max-w-md mx-auto">
                <p className="text-slate-500 italic">На данный момент новостей нет. Заходите позже!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
