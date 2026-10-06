"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const POSTS_SEED_VERSION = "tamimi-posts-v2";

export const POST_CATEGORIES = [
    "Events & Exhibitions",
    "News",
    "Insights",
];

export const POST_STATUSES = [
    "Draft",
    "Scheduled",
    "Published",
];

const withPostMeta = (item) => ({
    ...item,
    category: item.category || "News",
    status: item.status || "Draft",
    company_code: item.company_code || "",
    publish_date: item.publish_date || null,
    summary: item.summary || "",
    body: item.body || "",
    event_start: item.event_start || null,
    event_end: item.event_end || null,
    venue: item.venue || "",
    city: item.city || "",
    booth: item.booth || "",
    event_website: item.event_website || "",
    cover: item.cover || "",
    seo_title: item.seo_title || "",
    seo_description: item.seo_description || "",
    is_sample: Boolean(item.is_sample),
    created_at: item.created_at || "2026-03-01",
});

const MOCK_POSTS = [
    withPostMeta({
        id: 1,
        title: "[Sample] Tamimi Energy at a power & water forum in Riyadh",
        category: "Events & Exhibitions",
        status: "Scheduled",
        publish_date: "2026-12-02",
        company_code: "",
        is_sample: true,
        summary: "Sample event coverage for a power and water forum in Riyadh.",
        body: "<p>Sample article body for the Riyadh power and water forum.</p>",
        event_start: "2026-12-02",
        event_end: "2026-12-03",
        venue: "Forum venue",
        city: "Riyadh, Saudi Arabia",
        booth: "",
        event_website: "https://",
    }),
    withPostMeta({
        id: 2,
        title: "[Sample] Tamimi Energy at an industry exhibition in Dammam",
        category: "Events & Exhibitions",
        status: "Scheduled",
        publish_date: "2026-11-10",
        company_code: "",
        is_sample: true,
        summary: "Sample event coverage for an industry exhibition in Dammam.",
        body: "<p>Sample article body for the Dammam industry exhibition.</p>",
        event_start: "2026-11-10",
        event_end: "2026-11-12",
        venue: "Exhibition centre",
        city: "Dammam, Saudi Arabia",
    }),
    withPostMeta({
        id: 3,
        title: "[Sample] SESCO signs a new distribution agreement",
        category: "News",
        status: "Published",
        publish_date: "2026-09-22",
        company_code: "SESCO",
        is_sample: true,
        summary: "Sample news item about a SESCO distribution agreement.",
        body: "<p>Sample news body about the SESCO distribution agreement.</p>",
    }),
    withPostMeta({
        id: 4,
        title: "[Sample] Localizing turbine filtration in the Kingdom",
        category: "Insights",
        status: "Published",
        publish_date: "2026-09-05",
        company_code: "TFF",
        is_sample: true,
        summary: "Sample insight on localizing turbine filtration.",
        body: "<p>Sample insight body on local manufacturing of turbine filtration.</p>",
    }),
    withPostMeta({
        id: 5,
        title: "[Sample] GET Water deploys mobile units for a utility",
        category: "News",
        status: "Draft",
        publish_date: null,
        company_code: "GET Water",
        is_sample: true,
        summary: "Sample draft news about GET Water mobile units.",
        body: "<p>Draft news body.</p>",
    }),
    withPostMeta({
        id: 6,
        title: "[Sample] What Vision 2030 means for local manufacturing",
        category: "Insights",
        status: "Draft",
        publish_date: null,
        company_code: "",
        is_sample: true,
        summary: "Sample draft insight on Vision 2030 and local manufacturing.",
        body: "<p>Draft insight body.</p>",
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededPosts() {
    const seedVersion = localStorage.getItem("posts_seed_version");

    if (seedVersion !== POSTS_SEED_VERSION) {
        localStorage.setItem("posts", JSON.stringify(MOCK_POSTS));
        localStorage.setItem("posts_seed_version", POSTS_SEED_VERSION);
        return MOCK_POSTS;
    }

    const stored = localStorage.getItem("posts");
    return stored ? JSON.parse(stored) : MOCK_POSTS;
}

function persistPosts(list) {
    const normalized = list.map(withPostMeta);
    localStorage.setItem("posts", JSON.stringify(normalized));
    return normalized;
}

export function usePosts() {
    return useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            await delay(400);
            return getSeededPosts().map(withPostMeta);
        },
    });
}

export function useTrashPosts() {
    return useQuery({
        queryKey: ["trash-posts"],
        queryFn: async () => {
            await delay(250);
            const stored = localStorage.getItem("trash-posts");
            return stored ? JSON.parse(stored).map(withPostMeta) : [];
        },
    });
}

export function useAddPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededPosts();
            const item = withPostMeta({
                ...newItem,
                id: Math.max(0, ...list.map((p) => p.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistPosts([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post added successfully!");
        },
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(400);
            const list = getSeededPosts();
            persistPosts(
                list.map((item) => (item.id === updated.id ? withPostMeta(updated) : item))
            );
            return withPostMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post updated successfully!");
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededPosts();
            const trash = JSON.parse(localStorage.getItem("trash-posts") || "[]");
            const item = list.find((p) => p.id === id);
            if (!item) return id;

            persistPosts(list.filter((p) => p.id !== id));
            localStorage.setItem("trash-posts", JSON.stringify([item, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["trash-posts"] });
            toast.success("Post moved to trash!");
        },
    });
}

export function useRestorePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededPosts();
            const trash = JSON.parse(localStorage.getItem("trash-posts") || "[]");
            const item = trash.find((p) => p.id === id);
            if (!item) return id;

            persistPosts([item, ...list]);
            localStorage.setItem(
                "trash-posts",
                JSON.stringify(trash.filter((p) => p.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["trash-posts"] });
            toast.success("Post restored successfully!");
        },
    });
}

export function usePermanentDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const trash = JSON.parse(localStorage.getItem("trash-posts") || "[]");
            localStorage.setItem(
                "trash-posts",
                JSON.stringify(trash.filter((p) => p.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-posts"] });
            toast.success("Post permanently deleted!");
        },
    });
}

export function useBulkDeletePosts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(400);
            const list = getSeededPosts();
            const trash = JSON.parse(localStorage.getItem("trash-posts") || "[]");
            const itemsToDelete = list.filter((item) => ids.includes(item.id));
            const remaining = list.filter((item) => !ids.includes(item.id));

            persistPosts(remaining);
            localStorage.setItem("trash-posts", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["trash-posts"] });
            toast.success("Selected posts moved to trash!");
        },
    });
}
