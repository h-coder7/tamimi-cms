"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import { companyFromApi, companyToFormData } from "@/lib/mappers/companies";
import { refreshListAndTrash } from "@/lib/queryRefresh";
import { t } from "@/lib/i18n";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await api.get("/companies", {
        params: { page: 1, perPage: 100 },
      });
      const rows = res.data?.data || [];
      return rows.map(companyFromApi);
    },
  });
}

export function useTrashCompanies({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-companies"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/companies", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      const rows = res.data?.data || [];
      return rows.map(companyFromApi);
    },
  });
}

export function useAddCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = companyToFormData(form);
      const res = await api.post("/companies", formData);
      return companyFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.added"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotAdd")));
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedCompany) => {
      const formData = companyToFormData(updatedCompany);
      const res = await api.patch(
        `/companies/${updatedCompany.id}`,
        formData
      );
      return companyFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotUpdate")));
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/companies/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.trashed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotDelete")));
    },
  });
}

export function useRestoreCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/companies/${id}/restore`);
      return companyFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.restored"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotRestore")));
    },
  });
}

export function usePermanentDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/companies/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.purged"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotPurge")));
    },
  });
}

export function useBulkDeleteCompanies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/companies/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "companies", "trash-companies");
      toast.success(t("toast.company.bulk"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotBulk")));
    },
  });
}
