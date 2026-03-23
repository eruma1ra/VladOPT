import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useProducts } from "@/hooks/use-products";
import { useHeroSlides } from "@/hooks/use-hero-slides";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: heroSlides } = useHeroSlides({ refetchInterval: 10_000 });
  const homeProducts = (products ?? []).filter((product) => product.showOnHome);
  const slides = (heroSlides ?? [])
    .map((slide) => slide.image)
    .filter((image): image is string => typeof image === "string" && image.trim().length > 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Carousel */}
      <section className="group/slider w-full py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {slides.length > 0 ? (
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
                        src={slide}
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
          ) : (
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100" />
          )}
        </div>
      </section>

      {!isLoading && homeProducts.length > 0 && (
        <section className="py-16 bg-slate-50" id="catalog">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                  Инструменты и расходные материалы для шиноремонта
                </h2>
              </div>
              <Link
                href="/catalog"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Весь каталог <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-12 text-center sm:hidden">
              <Link href="/catalog">
                <Button variant="outline" className="w-full rounded-xl border-none">
                  Смотреть все товары
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
