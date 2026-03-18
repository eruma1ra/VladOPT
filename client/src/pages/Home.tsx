import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useProducts } from "@/hooks/use-products";
import { useHeroSlides } from "@/hooks/use-hero-slides";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const fallbackSlides = [
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
  const { data: heroSlides } = useHeroSlides({ refetchInterval: 10_000 });
  const slides =
    heroSlides && heroSlides.length > 0
      ? heroSlides.map((slide) => ({
          title: slide.title,
          desc: slide.description,
          img: slide.image,
        }))
      : fallbackSlides;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Carousel */}
      <section className="group/slider w-full py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel
            className="w-full"
            plugins={[
              Autoplay({
                delay: 9000,
              }),
            ]}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {slides.map((slide, i) => (
                <CarouselItem key={i}>
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={slide.img}
                      alt={`Слайд ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              variant="ghost"
              className="-left-4 sm:-left-6 md:-left-6 lg:-left-16 h-20 w-20 border-0 [border-color:transparent] bg-transparent text-slate-900/75 hover:text-slate-900 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none hover:shadow-none active:shadow-none shadow-none transition-all duration-300 translate-y-[-50%] -translate-x-6 opacity-0 pointer-events-none group-hover/slider:opacity-100 group-hover/slider:translate-x-0 group-hover/slider:pointer-events-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16"
                aria-hidden="true"
              >
                <path d="M15 4 L8 12 L15 20" />
              </svg>
            </CarouselPrevious>
            <CarouselNext
              variant="ghost"
              className="-right-4 sm:-right-6 md:-right-6 lg:-right-16 h-20 w-20 border-0 [border-color:transparent] bg-transparent text-slate-900/75 hover:text-slate-900 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none hover:shadow-none active:shadow-none shadow-none transition-all duration-300 translate-y-[-50%] translate-x-6 opacity-0 pointer-events-none group-hover/slider:opacity-100 group-hover/slider:translate-x-0 group-hover/slider:pointer-events-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16"
                aria-hidden="true"
              >
                <path d="M9 4 L16 12 L9 20" />
              </svg>
            </CarouselNext>
          </Carousel>
        </div>
      </section>

      {/* Immediate Catalog Section */}
      <section className="py-16 bg-slate-50" id="catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Наш каталог</h2>
              <p className="text-slate-500 max-w-2xl">
                Инструменты и расходные материалы для шиноремонта
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
