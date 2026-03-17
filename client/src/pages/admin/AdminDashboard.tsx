import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-products";
import { useRequests } from "@/hooks/use-requests";
import { Package, InboxIcon, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: products } = useProducts();
  const { data: requests } = useRequests();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Доступ ограничен", description: "Перенаправление на страницу входа...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) return null;

  const newRequestsCount = requests?.filter(r => r.status === 'new').length || 0;
  const inStockProducts = products?.filter(p => p.availability === 'in_stock').length || 0;
  const outOfStockProducts = (products?.length || 0) - inStockProducts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">С возвращением, Дмитрий!</h1>
        <p className="text-slate-500">Обзор вашего каталога и входящих запросов.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 border-none shadow-xl shadow-slate-200/70 bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-500">Всего товаров</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                  {products?.length || 0}
                </div>
                <p className="text-sm text-slate-500 mt-3">Текущая карточка ассортимента</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">В наличии</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{inStockProducts}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Ожидается</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{outOfStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 border-none shadow-xl shadow-slate-200/70 bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Всего запросов</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                  {requests?.length || 0}
                </div>
                <p className="text-sm text-slate-500 mt-3">Оптовые заявки за все время</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-none shadow-xl shadow-blue-200/60 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-100">Новые запросы</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-5xl font-black tracking-tight leading-none">{newRequestsCount}</div>
                <p className="text-sm text-blue-100 mt-3">Требуют вашего внимания</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <InboxIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-none shadow-xl shadow-emerald-200/60 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-100">Статус системы</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-3xl font-black tracking-tight leading-none">Система работает</div>
                <p className="text-sm text-emerald-100 mt-3">Публичный каталог доступен</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
