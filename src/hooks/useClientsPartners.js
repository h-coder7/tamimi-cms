"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  clientFromApi,
  clientToFormData,
} from "@/lib/mappers/clients";
import { refreshListAndTrash } from "@/lib/queryRefresh";
import { t } from "@/lib/i18n";

export const PARTNER_TYPES = [
  "Client",
  "Strategic partner",
  "Technology alliance",
];

export function useClientsPartners() {
  return useQuery({
    queryKey: ["clients-partners"],
    queryFn: async () => {
      const res = await api.get("/clients", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || [])
        .map(clientFromApi)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
  });
}

export function useTrashClientsPartners({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-clients-partners"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/clients", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(clientFromApi);
    },
  });
}

export function useAddClientPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = clientToFormData(form);
      const res = await api.post("/clients", formData);
      return clientFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "clients-partners",
        "trash-clients-partners"
      );
      toast.success(t("toast.logo.added"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.logo.couldNotAdd")));
    },
  });
}

export function useUpdateClientPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const formData = clientToFormData(updated);
      const res = await api.patch(`/clients/${updated.id}`, formData);
      return clientFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "clients-partners",
        "trash-clients-partners"
      );
      toast.success(t("toast.logo.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.logo.couldNotUpdate")));
    },
  });
}

export function useDeleteClientPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/clients/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "clients-partners",
        "trash-clients-partners"
      );
      toast.success(t("toast.logo.trashed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.logo.couldNotDelete")));
    },
  });
}

export function useRestoreClientPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/clients/${id}/restore`);
      return clientFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "clients-partners",
        "trash-clients-partners"
      );
      toast.success(t("toast.logo.restored"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.logo.couldNotRestore")));
    },
  });
}

export function usePermanentDeleteClientPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/clients/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "clients-partners",
        "trash-clients-partners"
      );
      toast.success(t("toast.logo.purged"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotPurge")));
    },
  });
}
