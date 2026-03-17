import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, PackageX } from "lucide-react";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>();
  const [activeBrandId, setActiveBrandId] = useState<number | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: activeCategoryId,
    search: search.length > 2 ? search : undefined, // only search if > 2 chars
  });
  
  const { data: categories } = useCategories();

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Каталог продукции</h1>
          </div>
          <div className="w-full md:w-[440px] flex gap-2">
            <div className="relative flex-grow rounded-xl border-2 border-primary/35 bg-white focus-within:border-primary">
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
          <aside className={`lg:w-64 flex-shrink-0 space-y-8 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-display font-bold text-lg mb-4 text-slate-900 border-b border-slate-100 pb-2">Категории</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveCategoryId(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!activeCategoryId ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Все категории
                </button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
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
                  onClick={() => {
                    setSearch("");
                    setActiveCategoryId(undefined);
                    setActiveBrandId(undefined);
                  }}
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
    </div>
  );
}
