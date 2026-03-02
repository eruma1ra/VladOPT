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
      onSuccess: () => toast({ title: "Status updated" })
    });
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Incoming Requests</h1>
        <p className="text-slate-500">Manage wholesale inquiries from clients.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Inquiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString()}
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
                      Item: {r.product.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val)}>
                    <SelectTrigger className={`w-32 h-8 text-xs ${
                      r.status === 'new' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      r.status === 'in_progress' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {requests?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">No requests yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
