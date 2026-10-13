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
      toast.success("Job added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add job"));
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
      toast.success("Job updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update job"));
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
      toast.success("Job moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete job"));
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
      toast.success("Job restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore job"));
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
      toast.success("Job permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
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
      toast.success("Selected jobs moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete jobs"));
    },
  });
}
