import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Оптовые поставки вентилей",
    desc: "Прямые поставки от ведущих заводов-изготовителей. Гарантия качества и надежная логистика.",
    img: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Профессиональный инструмент",
    desc: "Широкий ассортимент инструментов для монтажа и обслуживания систем.",
    img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Продукция со склада",
    desc: "Большой запас продукции на складе. Быстрая отгрузка и доставка.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1200&auto=format&fit=crop"
  }
];

export default function Home() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Carousel */}
      <section className="relative w-full">
        <Carousel
          className="w-full"
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {slides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="relative h-[600px] w-full overflow-hidden">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
                      {slide.title}
                    </h2>
                    <p className="text-xl text-slate-200 mb-8 max-w-2xl">
                      {slide.desc}
                    </p>
                    <Link href="/catalog">
                      <Button size="lg" className="h-14 px-8 text-lg rounded-xl border-none">
                        Перейти в каталог
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="right-8 bg-transparent hover:bg-transparent border-none text-white/40 hover:text-white/80 transition-opacity [&_svg]:w-14 [&_svg]:h-14 shadow-none translate-x-0">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </CarouselNext>
          <CarouselPrevious className="left-8 bg-transparent hover:bg-transparent border-none text-white/40 hover:text-white/80 transition-opacity [&_svg]:w-14 [&_svg]:h-14 shadow-none translate-x-0">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </CarouselPrevious>
        </Carousel>
      </section>

      {/* Immediate Catalog Section */}
      <section className="py-16 bg-slate-50" id="catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Наш каталог</h2>
              <p className="text-slate-500 max-w-2xl">
                Профессиональное оборудование и инструменты для вашего бизнеса.
              </p>
            </div>
            <Link href="/catalog" className="hidden sm:flex items-center text-primary font-semibold hover:gap-2 transition-all">
              Весь каталог <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link href="/catalog">
              <Button variant="outline" className="w-full rounded-xl border-none">
                Смотреть все товары
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
