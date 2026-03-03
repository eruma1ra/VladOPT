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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Товар не найден</h2>
        <p className="text-slate-500 mb-6">Запрашиваемая позиция не существует или была удалена.</p>
        <Link href="/catalog">
          <Button className="border-none">Вернуться в каталог</Button>
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
          <ArrowLeft className="w-4 h-4 mr-1" /> Назад в каталог
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
                  <p>Изображение отсутствует</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.availability === 'in_stock' && (
                  <Badge className="bg-green-500 hover:bg-green-600 shadow-sm border-none text-white font-medium">В наличии</Badge>
                )}
                {product.availability === 'preorder' && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 font-medium">Под заказ</Badge>
                )}
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Арт: {product.sku}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {product.category && (
                <p className="text-primary font-semibold text-sm mb-6">
                  Категория: {product.category.name}
                </p>
              )}

              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {product.descriptionShort || "Профессиональное оборудование, соответствующее высоким стандартам качества. Для получения КП и документации отправьте запрос."}
              </p>

              {attributesList.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg border-l-4 border-primary pl-3">Характеристики</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {attributesList.map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="py-3 px-4 text-slate-500 font-medium w-1/3 border-r border-slate-100">{key}</td>
                            <td className="py-3 px-4 text-slate-900 font-medium">{value as React.ReactNode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <div className="bg-slate-900 rounded-2xl p-8 text-white mb-8 shadow-2xl shadow-slate-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h4 className="font-bold text-2xl mb-2 text-white">Уточнить цену</h4>
                      <p className="text-slate-400 text-sm max-w-[320px]">Наш менеджер подготовит индивидуальное предложение в течение 30 минут.</p>
                    </div>
                    <RequestModal 
                      productId={product.id}
                      productName={product.name}
                      trigger={
                        <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all border-none bg-primary text-white w-full md:w-auto">
                          Запросить КП
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Гарантия качества</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Быстрая отгрузка</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <PackageCheck className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Надежная упаковка</span>
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
