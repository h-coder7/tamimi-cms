"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  industryFromApi,
  industryToFormData,
  VALUE_CHAIN_STAGES,
  emptyValueChainMapping,
} from "@/lib/mappers/industries";
import { refreshListAndTrash } from "@/lib/queryRefresh";

export { VALUE_CHAIN_STAGES, emptyValueChainMapping };

async function loadCompanyCodeMap() {
  const res = await api.get("/companies", {
    params: { page: 1, perPage: 100 },
  });
  return (res.data?.data || []).map((c) => ({
    id: c.id,
    code: c.shortCode,
  }));
}

export function useIndustries() {
  return useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await api.get("/industries", {
        params: { page: 1, perPage: 100 },
      });
      const rows = res.data?.data || [];
      return rows.map(industryFromApi);
    },
  });
}

export function useTrashIndustries({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-industries"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/industries", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      const rows = res.data?.data || [];
      return rows.map(industryFromApi);
    },
  });
}

export function useAddIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form) => {
      const companies = await loadCompanyCodeMap();
      const formData = industryToFormData(form, companies);
      const res = await api.post("/industries", formData);
      return industryFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Industry added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add industry"));
    },
  });
}

export function useUpdateIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedIndustry) => {
      const companies = await loadCompanyCodeMap();
      const formData = industryToFormData(updatedIndustry, companies);
      const res = await api.patch(
        `/industries/${updatedIndustry.id}`,
        formData
      );
      return industryFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Industry updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update industry"));
    },
  });
}

export function useDeleteIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/industries/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      toast.success("Industry moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete industry"));
    },
  });
}

export function useRestoreIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/industries/${id}/restore`);
      return industryFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      toast.success("Industry restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore industry"));
    },
  });
}

export function usePermanentDeleteIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/industries/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      toast.success("Industry permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
    },
  });
}

export function useBulkDeleteIndustries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/industries/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "industries", "trash-industries");
      toast.success("Selected industries moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete industries"));
    },
  });
}
