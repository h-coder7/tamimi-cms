"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import { companyFromApi, companyToFormData } from "@/lib/mappers/companies";
import { refreshListAndTrash } from "@/lib/queryRefresh";

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
      toast.success("Company added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add company"));
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
      toast.success("Company updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update company"));
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
      toast.success("Company moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete company"));
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
      toast.success("Company restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore company"));
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
      toast.success("Company permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
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
      toast.success("Selected companies moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete companies"));
    },
  });
}
