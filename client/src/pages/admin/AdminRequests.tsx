import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequests, useUpdateRequestStatus } from "@/hooks/use-requests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminRequests() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: requests } = useRequests();
  const updateStatus = useUpdateRequestStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, isLoading]);

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Статус обновлен" })
    });
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Входящие заявки</h1>
        <p className="text-slate-500">Управление оптовыми запросами от клиентов.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Контакт</TableHead>
              <TableHead>Запрос</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{r.name}</div>
                  {r.company && <div className="text-xs text-slate-500">{r.company}</div>}
                </TableCell>
                <TableCell className="font-mono text-sm">{r.phone}</TableCell>
                <TableCell>
                  <div className="max-w-xs text-sm truncate" title={r.comment || ''}>
                    {r.comment || '-'}
                  </div>
                  {r.product && (
                    <div className="text-xs text-primary font-medium mt-1 truncate">
                      Товар: {r.product.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val)}>
                    <SelectTrigger className={`w-32 h-8 text-xs border-none ${
                      r.status === 'new' ? 'bg-blue-50 text-blue-800' :
                      r.status === 'in_progress' ? 'bg-amber-50 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новая</SelectItem>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="closed">Закрыта</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {requests?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">Заявок пока нет.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
