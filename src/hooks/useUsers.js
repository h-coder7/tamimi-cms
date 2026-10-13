"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import { refreshListAndTrash } from "@/lib/queryRefresh";

export const USER_STATUSES = ["Active", "Inactive"];

const STATUS_TO_API = {
  Active: "active",
  Inactive: "disabled",
};

const STATUS_TO_UI = {
  active: "Active",
  disabled: "Inactive",
};

function adminFromApi(admin) {
  return {
    id: admin.id,
    name: admin.fullName,
    email: admin.email,
    last_sign_in: admin.lastSignInAt
      ? String(admin.lastSignInAt).slice(0, 16).replace("T", " ")
      : "",
    status: STATUS_TO_UI[admin.status] || "Active",
    is_sample: false,
    locked: false,
    created_at: admin.createdAt ? String(admin.createdAt).slice(0, 10) : "",
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/admins", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(adminFromApi);
    },
  });
}

export function useTrashUsers({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["trash-users"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/admins", {
        params: { page: 1, perPage: 100, trashed: true },
      });
      return (res.data?.data || []).map(adminFromApi);
    },
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem) => {
      if (!newItem.password) {
        throw new Error("Password is required");
      }
      const password = newItem.password;
      const res = await api.post("/admins", {
        fullName: newItem.name,
        email: newItem.email,
        password,
        passwordConfirmation: newItem.passwordConfirmation || password,
      });
      return adminFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "users", "trash-users");
      toast.success("Admin created successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create admin"));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const payload = {
        fullName: updated.name,
        status: STATUS_TO_API[updated.status] || "active",
      };
      if (updated.password) {
        payload.password = updated.password;
        payload.passwordConfirmation =
          updated.passwordConfirmation || updated.password;
      }
      const res = await api.patch(`/admins/${updated.id}`, payload);
      return adminFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "users", "trash-users");
      toast.success("Admin updated successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update admin"));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admins/${id}`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "users", "trash-users");
      toast.success("Admin moved to trash!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete admin"));
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/admins/${id}/restore`);
      return adminFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "users", "trash-users");
      toast.success("Admin restored successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not restore admin"));
    },
  });
}

export function usePermanentDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admins/${id}/purge`);
      return id;
    },
    onSuccess: async () => {
      await refreshListAndTrash(queryClient, "users", "trash-users");
      toast.success("Admin permanently deleted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not permanently delete"));
    },
  });
}
