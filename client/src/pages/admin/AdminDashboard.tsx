import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-products";
import { useRequests } from "@/hooks/use-requests";
import { useSiteSettings, useUpdateSiteThemeMode } from "@/hooks/use-site-settings";
import { Package, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { SiteThemeMode } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: products } = useProducts();
  const { data: requests } = useRequests();
  const { data: siteSettings } = useSiteSettings();
  const updateSiteThemeMode = useUpdateSiteThemeMode();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Доступ ограничен", description: "Перенаправление на страницу входа...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) return null;

  const activeRequestsCount = requests?.filter(r => r.status === 'new').length || 0;
  const inProgressRequestsCount = requests?.filter(r => r.status === "in_progress").length || 0;
  const closedRequestsCount = requests?.filter(r => r.status === "closed").length || 0;
  const inStockProducts = products?.filter(p => p.availability === 'in_stock').length || 0;
  const outOfStockProducts = (products?.length || 0) - inStockProducts;
  const currentThemeMode = siteSettings?.themeMode ?? "blue";

  const handleThemeChange = (themeMode: SiteThemeMode) => {
    if (themeMode === currentThemeMode || updateSiteThemeMode.isPending) return;

    updateSiteThemeMode.mutate(themeMode, {
      onSuccess: () => {
        toast({
          title: "Режим обновлен",
          description: themeMode === "red" ? "Включен красный режим." : "Включен синий режим.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка изменения режима",
          description: error?.message || "Не удалось обновить настройки темы",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">С возвращением, Дмитрий!</h1>
        <p className="text-sm sm:text-base text-slate-500">Обзор каталога и входящих запросов.</p>
      </div>

      <Card className="border-none shadow-lg shadow-slate-200/60 bg-white rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-500">Цветовой режим сайта</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant={currentThemeMode === "blue" ? "default" : "outline"}
              className={currentThemeMode === "blue" ? "border-none" : "border-slate-200"}
              onClick={() => handleThemeChange("blue")}
              disabled={updateSiteThemeMode.isPending}
            >
              Синий режим
            </Button>
            <Button
              type="button"
              variant={currentThemeMode === "red" ? "default" : "outline"}
              className={currentThemeMode === "red" ? "border-none" : "border-slate-200"}
              onClick={() => handleThemeChange("red")}
              disabled={updateSiteThemeMode.isPending}
            >
              Красный режим
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Card className="lg:col-span-7 border-none shadow-xl shadow-slate-200/70 bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-500">Всего товаров</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start justify-between gap-4 sm:gap-6">
              <div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
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
            <div className="flex items-start justify-between gap-4 sm:gap-6">
              <div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
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

        <Card className="lg:col-span-12 border-none shadow-xl shadow-slate-200/60 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Статусы заявок</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-primary/80">Активные</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-primary mt-1">
                  {activeRequestsCount}
                </p>
                <p className="text-xs text-slate-500 mt-2">Новые заявки</p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-amber-700">В работе</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-amber-700 mt-1">
                  {inProgressRequestsCount}
                </p>
                <p className="text-xs text-slate-500 mt-2">В процессе обработки</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Закрытые</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-700 mt-1">
                  {closedRequestsCount}
                </p>
                <p className="text-xs text-slate-500 mt-2">Завершенные заявки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
