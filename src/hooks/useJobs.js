"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  JOB_CITIES,
  JOB_STATUSES,
  jobFromApi,
  jobToApiPayload,
} from "@/lib/mappers/jobs";
import { refreshListAndTrash } from "@/lib/queryRefresh";
import { t } from "@/lib/i18n";

export { JOB_CITIES, JOB_STATUSES };

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(jobFromApi);
    },
  });
}

export function useTrashJobs({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-jobs"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/jobs", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(jobFromApi);
    },
  });
}

export function useAddJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const res = await api.post("/jobs", jobToApiPayload(form));
      return jobFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.added"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.job.couldNotAdd")));
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const res = await api.patch(
        `/jobs/${updated.id}`,
        jobToApiPayload(updated)
      );
      return jobFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.updated"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.job.couldNotUpdate")));
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/jobs/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.trashed"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.job.couldNotDelete")));
    },
  });
}

export function useRestoreJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/jobs/${id}/restore`);
      return jobFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.restored"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.job.couldNotRestore")));
    },
  });
}

export function usePermanentDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/jobs/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.purged"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.company.couldNotPurge")));
    },
  });
}

export function useBulkDeleteJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/jobs/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "jobs", "trash-jobs");
      toast.success(t("toast.job.bulk"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.job.couldNotBulk")));
    },
  });
}
