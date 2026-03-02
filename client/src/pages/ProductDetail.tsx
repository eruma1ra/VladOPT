import { useParams, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShieldCheck, Truck, PackageCheck, Image as ImageIcon } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The item you are looking for doesn't exist or was removed.</p>
        <Link href="/catalog">
          <Button>Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[0];
  const attributesList = product.attributes ? Object.entries(product.attributes) : [];

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/catalog" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalog
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Section */}
            <div className="bg-slate-100/50 p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 min-h-[400px]">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="max-w-full max-h-[500px] object-contain drop-shadow-xl"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon className="w-24 h-24 mb-4 opacity-20" />
                  <p>Image currently unavailable</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.availability === 'in_stock' && (
                  <Badge className="bg-green-500 hover:bg-green-600 shadow-sm border-none">In Stock</Badge>
                )}
                {product.availability === 'preorder' && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Pre-order Available</Badge>
                )}
                {product.brand && (
                  <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
                    {product.brand.name}
                  </Badge>
                )}
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {product.category && (
                <p className="text-primary font-medium text-sm mb-6">
                  Category: {product.category.name}
                </p>
              )}

              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {product.descriptionShort || "This professional-grade product meets industry standards for safety and longevity. Contact our wholesale department for full technical specifications and certification documents."}
              </p>

              {attributesList.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-semibold text-slate-900 mb-4 text-lg">Technical Attributes</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {attributesList.map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="py-3 px-4 text-slate-500 font-medium w-1/3 border-r border-slate-100">{key}</td>
                            <td className="py-3 px-4 text-slate-900">{value as React.ReactNode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-6">
                  <h4 className="font-bold text-slate-900 mb-2">Wholesale Pricing</h4>
                  <p className="text-slate-600 text-sm mb-4">Prices are calculated individually based on order volume, delivery location, and partnership history.</p>
                  <RequestModal 
                    productId={product.id}
                    productName={product.name}
                    trigger={
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all">
                        Request Price & Availability
                      </Button>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>Certified Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-primary" />
                    <span>Secure Packaging</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
