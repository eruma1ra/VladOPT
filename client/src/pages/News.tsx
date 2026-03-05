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
    <div className="bg-white min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6 tracking-tight text-center md:text-left">Новости</h1>
          <div className="h-1.5 w-24 bg-primary rounded-full mb-8 mx-auto md:mx-0" />
          <p className="text-slate-500 text-xl max-w-2xl leading-relaxed text-center md:text-left">Последние события, обновления ассортимента и эксклюзивные предложения от компании ВладОПТ.</p>
        </div>

        <div className="space-y-16">
          {activeNews.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="group border-none shadow-none bg-transparent cursor-pointer overflow-visible">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
                  {/* Image Container */}
                  <div className="relative w-full md:w-[45%] aspect-[16/10] md:aspect-auto md:h-[380px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    {item.status === 'limited_offer' && (
                      <div className="absolute top-6 left-6 z-10">
                        <Badge className="bg-primary/90 backdrop-blur-md border-none text-white font-bold py-2 px-5 rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">
                          Спецпредложение
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500" />
                  </div>

                  {/* Content Container */}
                  <CardContent className="p-0 flex-grow">
                    <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6">
                      <span className="w-8 h-[2px] bg-primary/30" />
                      {new Date(item.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-[1.15] tracking-tight group-hover:text-slate-900 transition-none">
                      {item.title}
                    </h2>
                    
                    <p className="text-slate-500 text-lg md:text-xl leading-relaxed line-clamp-3 mb-10 font-normal">
                      {item.content}
                    </p>
                    
                    <div className="inline-flex items-center gap-4 text-slate-900 font-bold text-lg group-hover:gap-6 transition-all duration-300">
                      Подробнее 
                      <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
          
          {activeNews.length === 0 && (
            <div className="py-32 text-center">
              <div className="max-w-md mx-auto">
                <p className="text-slate-400 italic text-xl">Раздел временно пуст. Новые новости появятся совсем скоро.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
