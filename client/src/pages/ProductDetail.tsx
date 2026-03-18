import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from "lucide-react";

function formatAttributeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const hiddenAttributeKeyPrefixes = ["код", "остаток", "quantity", "qty", "stock"];

function isPublicAttributeKey(rawKey: string): boolean {
  const normalizedKey = rawKey.toLowerCase().replace(/[\s._-]+/g, "");
  return !hiddenAttributeKeyPrefixes.some((prefix) => normalizedKey.startsWith(prefix));
}

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: product, isLoading } = useProduct(id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const imageList = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  const activeImage = imageList[activeImageIdx];
  const attributesList = product?.attributes
    ? Object.entries(product.attributes).filter(([key]) => isPublicAttributeKey(key))
    : [];

  useEffect(() => {
    setActiveImageIdx(0);
  }, [product?.id]);

  const goPrevImage = () => {
    if (imageList.length === 0) return;
    setActiveImageIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const goNextImage = () => {
    if (imageList.length === 0) return;
    setActiveImageIdx((prev) => (prev + 1) % imageList.length);
  };

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

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/catalog"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад в каталог
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Section */}
            <div className="bg-white p-5 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold tracking-wide uppercase">Фото товара</span>
                {imageList.length > 1 && <span>{activeImageIdx + 1} / {imageList.length}</span>}
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white aspect-square">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="h-full w-full object-contain p-5 md:p-7"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-24 h-24 mb-4 opacity-20" />
                    <p>Изображение отсутствует</p>
                  </div>
                )}

                {imageList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-colors"
                      aria-label="Предыдущее изображение"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-colors"
                      aria-label="Следующее изображение"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {imageList.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {imageList.map((imageUrl, idx) => (
                    <button
                      key={`${imageUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`overflow-hidden rounded-lg aspect-square transition-opacity ${
                        activeImageIdx === idx ? "opacity-100" : "opacity-65 hover:opacity-85"
                      }`}
                    >
                      <img src={imageUrl} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover bg-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-10 flex flex-col bg-white">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.availability === 'in_stock' && (
                  <Badge className="bg-green-500 hover:bg-green-600 shadow-sm border-none text-white font-medium">В наличии</Badge>
                )}
                {product.availability !== 'in_stock' && (
                  <Badge variant="secondary" className="bg-red-400/85 text-white border-none font-medium">Ожидается</Badge>
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

              <section className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Описание</p>
                <p className="text-slate-700 text-[1.08rem] md:text-[1.18rem] leading-relaxed">
                  {product.descriptionShort || "Описание товара предоставляется по запросу."}
                </p>
                <div className="mt-4 h-[2px] w-24 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
              </section>

              {attributesList.length > 0 && (
                <section className="mb-8">
                  <h3 className="font-bold text-slate-900 mb-4 text-xl">Характеристики</h3>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                      <tbody>
                        {attributesList.map(([key, value], idx) => (
                          <tr
                            key={key}
                            className={`group transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-primary/[0.05] ${
                              idx === attributesList.length - 1 ? "" : "border-b border-slate-100"
                            }`}
                          >
                            <td className="py-2.5 px-4 text-slate-500 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.08em] w-[42%] border-r border-slate-100 align-top">
                              {key}
                            </td>
                            <td className="py-2.5 px-4 text-slate-900 text-[14px] md:text-[15px] font-semibold break-words">
                              {formatAttributeValue(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <div className="mt-auto">
                <div className="rounded-2xl p-6 mb-8 border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="text-left w-full space-y-2">
                      <h4 className="font-bold text-2xl text-slate-900">Цена</h4>
                      <p className="text-slate-500 text-sm">Вышлем прайс по запросу.</p>
                    </div>
                    <div className="flex justify-center w-full md:w-auto">
                      <RequestModal 
                        productId={product.id}
                        productName={product.name}
                        trigger={
                          <Button size="lg" className="h-14 px-10 text-base font-bold rounded-xl transition-all border-none bg-primary text-white w-full md:w-auto">
                            Запросить стоимость
                          </Button>
                        }
                      />
                    </div>
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
