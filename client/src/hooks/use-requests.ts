import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Request, type InsertRequest } from "@shared/schema";

export function useRequests() {
  return useQuery({
    queryKey: [api.requests.list.path],
    queryFn: async () => {
      const res = await fetch(api.requests.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch requests");
      return (await res.json()) as (Request & { product?: any })[];
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRequest) => {
      const res = await fetch(api.requests.create.path, {
        method: api.requests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.requests.list.path] }),
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete request");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.requests.list.path] }),
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.requests.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.requests.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.requests.list.path] }),
  });
}
