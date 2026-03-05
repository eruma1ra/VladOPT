import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequests, useUpdateRequestStatus, useDeleteRequest } from "@/hooks/use-requests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminRequests() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: requests } = useRequests();
  const updateStatus = useUpdateRequestStatus();
  const deleteRequest = useDeleteRequest();
  const { toast } = useToast();

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/api/login";
  }, [isAuthenticated, isLoading]);

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => {
        toast({ title: "Статус обновлен" });
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту заявку?")) {
      deleteRequest.mutate(id, {
        onSuccess: () => {
          toast({ title: "Заявка удалена" });
          setSelectedRequest(null);
        }
      });
    }
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
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedRequest(r)}>
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
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary mr-2" onClick={() => setSelectedRequest(r)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {requests?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">Заявок пока нет.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Детали заявки</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Дата поступления</label>
                  <div className="text-sm font-medium text-slate-900">
                    {new Date(selectedRequest.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Статус</label>
                  <div className="mt-1">
                    <Select value={selectedRequest.status} onValueChange={(val) => handleStatusChange(selectedRequest.id, val)}>
                      <SelectTrigger className={`w-32 h-8 text-xs border-none ${
                        selectedRequest.status === 'new' ? 'bg-blue-50 text-blue-800' :
                        selectedRequest.status === 'in_progress' ? 'bg-amber-50 text-amber-800' :
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
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Клиент</label>
                <div className="text-base font-bold text-slate-900">{selectedRequest.name}</div>
                {selectedRequest.company && (
                  <div className="text-sm text-slate-500 font-medium">{selectedRequest.company}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Телефон</label>
                  <div className="text-sm font-mono text-slate-900">{selectedRequest.phone}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <div className="text-sm font-mono text-slate-900">{selectedRequest.email || '-'}</div>
                </div>
              </div>

              {selectedRequest.product && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Интересующий товар</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-1">
                    <div className="text-sm font-bold text-slate-900">{selectedRequest.product.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">Арт: {selectedRequest.product.sku}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Комментарий к заказу</label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {selectedRequest.comment || 'Комментарий отсутствует'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-6 gap-2">
            <Button variant="ghost" className="text-slate-500 font-bold" onClick={() => setSelectedRequest(null)}>Закрыть</Button>
            <Button variant="destructive" className="font-bold border-none" onClick={() => handleDelete(selectedRequest?.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Удалить заявку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
