import { useNews } from "@/hooks/use-news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Image as ImageIcon } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeNews.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="relative h-56 overflow-hidden bg-slate-200">
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
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(item.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-grow">
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
          {activeNews.length === 0 && (
            <div className="col-span-full py-20 text-center">
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
