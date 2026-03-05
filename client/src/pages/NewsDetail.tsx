import { useParams, Link } from "wouter";
import { useNewsItem } from "@/hooks/use-news";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsDetail() {
  const { id } = useParams();
  const { data: item, isLoading } = useNewsItem(Number(id));

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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Новость не найдена</h2>
        <Link href="/news">
          <Button className="border-none mt-4">Вернуться к новостям</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/news" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> К списку новостей
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="relative h-[400px] w-full bg-slate-200">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-slate-300" />
              </div>
            )}
            {item.status === 'limited_offer' && (
              <div className="absolute top-6 left-6">
                <Badge className="bg-amber-500 border-none text-white font-bold py-1.5 px-4 shadow-xl">
                  Предложение
                </Badge>
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center text-slate-400 text-sm font-bold uppercase tracking-wider mb-6">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(item.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-8 leading-tight">
              {item.title}
            </h1>

            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {item.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
