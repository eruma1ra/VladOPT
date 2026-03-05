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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">С возвращением, Дмитрий!</h1>
        <p className="text-slate-500">Обзор вашего каталога и входящих запросов.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Всего товаров</CardTitle>
            <Package className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{products?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">{inStockProducts} сейчас в наличии</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Всего запросов</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{requests?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Оптовые запросы за все время</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Новые запросы</CardTitle>
            <InboxIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{newRequestsCount}</div>
            <p className="text-xs text-blue-600 mt-1">Требуют вашего внимания</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Статус системы</CardTitle>
            <AlertCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 mt-1">Система работает</div>
            <p className="text-xs text-slate-500 mt-2">Публичный каталог доступен</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
