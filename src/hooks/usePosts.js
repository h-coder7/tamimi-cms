"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  POST_CATEGORIES,
  POST_STATUSES,
  postFromApi,
  postToFormData,
} from "@/lib/mappers/posts";
import { refreshListAndTrash } from "@/lib/queryRefresh";

export { POST_CATEGORIES, POST_STATUSES };

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await api.get("/posts", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(postFromApi);
    },
  });
}

export function useTrashPosts({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-posts"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/posts", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(postFromApi);
    },
  });
}

export function useAddPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = postToFormData(form);
      const res = await api.post("/posts", formData);
      return postFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Post added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add post"));
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const formData = postToFormData(updated);
      const res = await api.patch(`/posts/${updated.id}`, formData);
      return postFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Post updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update post"));
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/posts/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Post moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete post"));
    },
  });
}

export function useRestorePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/posts/${id}/restore`);
      return postFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Post restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore post"));
    },
  });
}

export function usePermanentDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/posts/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Post permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
    },
  });
}

export function useBulkDeletePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/posts/${id}`)));
      return ids;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "posts", "trash-posts");
      toast.success("Selected posts moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete posts"));
    },
  });
}
