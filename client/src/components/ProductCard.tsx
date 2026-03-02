import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { RequestModal } from "./RequestModal";

interface ProductCardProps {
  product: Product & { category?: any; brand?: any };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];

  return (
    <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      <Link href={`/catalog/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50 flex-shrink-0">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Package className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-sm">No photo</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.availability === 'in_stock' && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 border-none shadow-sm">
              В наличии
            </Badge>
          )}
          {product.availability === 'preorder' && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
              Под заказ
            </Badge>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            Арт: {product.sku}
          </span>
          {product.brand && (
            <span className="text-primary font-medium">{product.brand.name}</span>
          )}
        </div>
        
        <Link href={`/catalog/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-display font-semibold text-lg leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {product.descriptionShort || "Промышленный компонент доступен для оптового заказа."}
        </p>
        
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
          <RequestModal 
            productId={product.id}
            productName={product.name}
            trigger={
              <Button className="flex-1 rounded-xl" variant="outline">
                Запросить цену
              </Button>
            }
          />
          <Link href={`/catalog/${product.id}`} className="inline-flex">
            <Button size="icon" variant="ghost" className="rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
