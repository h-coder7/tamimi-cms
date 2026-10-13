"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  projectFromApi,
  projectToFormData,
} from "@/lib/mappers/projects";
import { refreshListAndTrash } from "@/lib/queryRefresh";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(projectFromApi);
    },
  });
}

export function useTrashProjects({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-projects"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/projects", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(projectFromApi);
    },
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = projectToFormData(form);
      const res = await api.post("/projects", formData);
      return projectFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Project added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add project"));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const formData = projectToFormData(updated);
      const res = await api.patch(`/projects/${updated.id}`, formData);
      return projectFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Project updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update project"));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Project moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete project"));
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/projects/${id}/restore`);
      return projectFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Project restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore project"));
    },
  });
}

export function usePermanentDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/projects/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Project permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
    },
  });
}

export function useBulkDeleteProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/projects/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "projects", "trash-projects");
      toast.success("Selected projects moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete projects"));
    },
  });
}
