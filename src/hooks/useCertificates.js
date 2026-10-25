"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  CERTIFICATE_TYPES,
  certificateFromApi,
  certificateToFormData,
} from "@/lib/mappers/certificates";
import { refreshListAndTrash } from "@/lib/queryRefresh";
import { t } from "@/lib/i18n";

export { CERTIFICATE_TYPES };

export function useCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const res = await api.get("/certificates", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(certificateFromApi);
    },
  });
}

export function useTrashCertificates({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-certificates"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/certificates", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(certificateFromApi);
    },
  });
}

export function useAddCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = certificateToFormData(form);
      const res = await api.post("/certificates", formData);
      return certificateFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.added"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.certificate.couldNotAdd")));
    },
  });
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const formData = certificateToFormData(updated);
      const res = await api.patch(`/certificates/${updated.id}`, formData);
      return certificateFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.certificate.couldNotUpdate")));
    },
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/certificates/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.trashed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.certificate.couldNotDelete")));
    },
  });
}

export function useRestoreCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/certificates/${id}/restore`);
      return certificateFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.restored"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.certificate.couldNotRestore")));
    },
  });
}

export function usePermanentDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/certificates/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.purged"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotPurge")));
    },
  });
}

export function useBulkDeleteCertificates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/certificates/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(
        queryClient,
        "certificates",
        "trash-certificates"
      );
      toast.success(t("toast.certificate.bulk"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.certificate.couldNotBulk")));
    },
  });
}
