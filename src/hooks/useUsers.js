"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const USERS_SEED_VERSION = "tamimi-users-v1";

export const USER_ROLES = [
    {
        value: "Admin",
        label: "Admin",
        description: "Admin: full access to all CMS modules",
    },
];

export const USER_STATUSES = ["Active", "Invited", "Inactive"];

const withUserMeta = (item) => ({
    ...item,
    name: item.name || "",
    email: item.email || "",
    role: item.role || "Admin",
    last_sign_in: item.last_sign_in || "",
    status: item.status || "Invited",
    is_sample: Boolean(item.is_sample),
    created_at: item.created_at || "2026-03-01",
});

const MOCK_USERS = [
    withUserMeta({
        id: 1,
        name: "[Sample] Marketing Admin",
        email: "[Sample] admin@tamimienergy.com",
        role: "Admin",
        last_sign_in: "Today",
        status: "Active",
        is_sample: true,
        locked: true,
    }),
    withUserMeta({
        id: 2,
        name: "[Sample] Content Editor",
        email: "[Sample] editor@tamimienergy.com",
        role: "Admin",
        last_sign_in: "Yesterday",
        status: "Active",
        is_sample: true,
    }),
    withUserMeta({
        id: 3,
        name: "[Sample] HR Coordinator",
        email: "[Sample] hr@tamimienergy.com",
        role: "Admin",
        last_sign_in: "",
        status: "Invited",
        is_sample: true,
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededUsers() {
    const seedVersion = localStorage.getItem("users_seed_version");

    if (seedVersion !== USERS_SEED_VERSION) {
        localStorage.setItem("users", JSON.stringify(MOCK_USERS));
        localStorage.setItem("users_seed_version", USERS_SEED_VERSION);
        return MOCK_USERS;
    }

    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : MOCK_USERS;
}

function persistUsers(list) {
    const normalized = list.map(withUserMeta);
    localStorage.setItem("users", JSON.stringify(normalized));
    return normalized;
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            await delay(350);
            return getSeededUsers().map(withUserMeta);
        },
    });
}

export function useAddUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededUsers();
            const item = withUserMeta({
                ...newItem,
                id: Math.max(0, ...list.map((u) => u.id)) + 1,
                last_sign_in: "",
                status: "Invited",
                created_at: new Date().toISOString().split("T")[0],
            });
            persistUsers([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Invite sent successfully!");
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(350);
            const list = getSeededUsers();
            persistUsers(
                list.map((item) => (item.id === updated.id ? withUserMeta(updated) : item))
            );
            return withUserMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully!");
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(350);
            const list = getSeededUsers();
            const item = list.find((u) => u.id === id);
            if (item?.locked) {
                throw new Error("This user cannot be deleted.");
            }
            persistUsers(list.filter((u) => u.id !== id));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User removed!");
        },
        onError: (error) => {
            toast.error(error.message || "Could not delete user.");
        },
    });
}
