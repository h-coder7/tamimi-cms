"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  DOWNLOAD_STATUSES,
  DOWNLOAD_TYPES,
  downloadFromApi,
  downloadToFormData,
} from "@/lib/mappers/downloads";
import { refreshListAndTrash } from "@/lib/queryRefresh";

export { DOWNLOAD_TYPES, DOWNLOAD_STATUSES };

export function useDownloads() {
  return useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const res = await api.get("/downloads", {
        params: { page: 1, perPage: 100, sort: "-createdAt" },
      });
      return (res.data?.data || []).map(downloadFromApi);
    },
  });
}

export function useTrashDownloads({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-downloads"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/downloads", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(downloadFromApi);
    },
  });
}

export function useAddDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = downloadToFormData(form);
      const res = await api.post("/downloads", formData);
      return downloadFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("File added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add file"));
    },
  });
}

export function useUpdateDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const formData = downloadToFormData(updated);
      const res = await api.patch(`/downloads/${updated.id}`, formData);
      return downloadFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("File updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update file"));
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/downloads/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("File moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete file"));
    },
  });
}

export function useRestoreDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/downloads/${id}/restore`);
      return downloadFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("File restored!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore file"));
    },
  });
}

export function usePermanentDeleteDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/downloads/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("File permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete file"));
    },
  });
}

export function useBulkDeleteDownloads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/downloads/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "downloads", "trash-downloads");
      toast.success("Selected files moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete selected files"));
    },
  });
}
