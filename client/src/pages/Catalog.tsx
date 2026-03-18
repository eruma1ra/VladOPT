import { useEffect, useRef, useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, PackageX, ArrowUp } from "lucide-react";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>();
  const [activeBrandId, setActiveBrandId] = useState<number | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const catalogTopRef = useRef<HTMLDivElement | null>(null);

  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: activeCategoryId,
    search: search.length > 2 ? search : undefined, // only search if > 2 chars
  });
  
  const { data: categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollCatalogToTop = () => {
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollPageToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId?: number) => {
    setActiveCategoryId(categoryId);
    scrollPageToTop();
  };

  const handleResetFilters = () => {
    setSearch("");
    setActiveCategoryId(undefined);
    setActiveBrandId(undefined);
    scrollPageToTop();
  };

  return (
    <div ref={catalogTopRef} className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Каталог продукции</h1>
          </div>
          <div className="w-full md:w-[440px] flex gap-2">
            <div className="relative flex-grow rounded-xl border-2 border-primary/35 bg-white hover:border-primary/80 focus-within:border-primary/80 transition-colors">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <Input 
                placeholder="Поиск по артикулу или названию..." 
                className="pl-12 h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:shadow-none text-[15px] placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="md:hidden rounded-xl border-none"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 space-y-8 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto ${
              mobileFiltersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-display font-bold text-lg mb-4 text-slate-900 border-b border-slate-100 pb-2">Категории</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategoryChange(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!activeCategoryId ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Все категории
                </button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategoryId === cat.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            {productsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <PackageX className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Товары не найдены</h3>
                <p className="text-slate-500">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl"
                  onClick={handleResetFilters}
                >
                  Сбросить все фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollCatalogToTop}
        aria-label="Наверх"
        className={`fixed right-5 bottom-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition-all duration-200 hover:border-primary/60 hover:text-primary ${
          showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
