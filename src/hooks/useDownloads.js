"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const DOWNLOADS_SEED_VERSION = "tamimi-downloads-v1";

export const DOWNLOAD_TYPES = [
    "Company profile",
    "Brochure",
    "Catalog",
    "Datasheet",
    "Other",
];

export const DOWNLOAD_STATUSES = [
    "Draft",
    "Published",
    "Needs update",
    "Pending file",
];

const withDownloadMeta = (item) => {
    const file = item.file || "";
    const format = file ? (item.format || "PDF") : "—";
    const status = item.status || (file ? "Draft" : "Pending file");

    return {
        ...item,
        title: item.title || "",
        title_ar: item.title_ar || "",
        type: item.type || "Brochure",
        company_code: item.company_code || "TEG",
        company_label: item.company_label || "",
        file,
        cover: item.cover || "",
        description: item.description || "",
        description_ar: item.description_ar || "",
        format,
        status,
        is_sample: Boolean(item.is_sample),
        created_at: item.created_at || "2026-03-01",
    };
};

const MOCK_DOWNLOADS = [
    withDownloadMeta({
        id: 1,
        title: "Tamimi Energy Group Profile",
        title_ar: "ملف مجموعة تميمي للطاقة",
        type: "Company profile",
        company_code: "TEG",
        company_label: "Tamimi Energy Group",
        file: "/files/teg-profile.pdf",
        format: "PDF",
        status: "Needs update",
        is_sample: true,
    }),
    withDownloadMeta({
        id: 2,
        title: "SESCO brochure",
        title_ar: "بروشور سيسكو",
        type: "Brochure",
        company_code: "SESCO",
        company_label: "SESCO",
        file: "",
        status: "Pending file",
        is_sample: true,
    }),
    withDownloadMeta({
        id: 3,
        title: "ENERCO brochure",
        title_ar: "بروشور إنركو",
        type: "Brochure",
        company_code: "ENERCO",
        company_label: "ENERCO",
        file: "",
        status: "Pending file",
        is_sample: true,
    }),
    withDownloadMeta({
        id: 4,
        title: "TCO brochure",
        title_ar: "بروشور تي سي أو",
        type: "Brochure",
        company_code: "TCO",
        company_label: "TCO",
        file: "",
        status: "Pending file",
        is_sample: true,
    }),
    withDownloadMeta({
        id: 5,
        title: "S3C brochure",
        title_ar: "بروشور إس ثري سي",
        type: "Brochure",
        company_code: "S3C",
        company_label: "S3C",
        file: "",
        status: "Pending file",
        is_sample: true,
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededDownloads() {
    const seedVersion = localStorage.getItem("downloads_seed_version");

    if (seedVersion !== DOWNLOADS_SEED_VERSION) {
        localStorage.setItem("downloads", JSON.stringify(MOCK_DOWNLOADS));
        localStorage.setItem("downloads_seed_version", DOWNLOADS_SEED_VERSION);
        return MOCK_DOWNLOADS;
    }

    const stored = localStorage.getItem("downloads");
    return stored ? JSON.parse(stored) : MOCK_DOWNLOADS;
}

function persistDownloads(list) {
    const normalized = list.map(withDownloadMeta);
    localStorage.setItem("downloads", JSON.stringify(normalized));
    return normalized;
}

export function useDownloads() {
    return useQuery({
        queryKey: ["downloads"],
        queryFn: async () => {
            await delay(400);
            return getSeededDownloads().map(withDownloadMeta);
        },
    });
}

export function useTrashDownloads() {
    return useQuery({
        queryKey: ["trash-downloads"],
        queryFn: async () => {
            await delay(250);
            const stored = localStorage.getItem("trash-downloads");
            return stored ? JSON.parse(stored).map(withDownloadMeta) : [];
        },
    });
}

export function useAddDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededDownloads();
            const item = withDownloadMeta({
                ...newItem,
                id: Math.max(0, ...list.map((d) => d.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistDownloads([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads"] });
            toast.success("File added successfully!");
        },
    });
}

export function useUpdateDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(400);
            const list = getSeededDownloads();
            persistDownloads(
                list.map((item) => (item.id === updated.id ? withDownloadMeta(updated) : item))
            );
            return withDownloadMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads"] });
            toast.success("File updated successfully!");
        },
    });
}

export function useDeleteDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededDownloads();
            const trash = JSON.parse(localStorage.getItem("trash-downloads") || "[]");
            const item = list.find((d) => d.id === id);
            if (!item) return id;

            persistDownloads(list.filter((d) => d.id !== id));
            localStorage.setItem("trash-downloads", JSON.stringify([item, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads"] });
            queryClient.invalidateQueries({ queryKey: ["trash-downloads"] });
            toast.success("File moved to trash!");
        },
    });
}

export function useRestoreDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededDownloads();
            const trash = JSON.parse(localStorage.getItem("trash-downloads") || "[]");
            const item = trash.find((d) => d.id === id);
            if (!item) return id;

            persistDownloads([item, ...list]);
            localStorage.setItem(
                "trash-downloads",
                JSON.stringify(trash.filter((d) => d.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads"] });
            queryClient.invalidateQueries({ queryKey: ["trash-downloads"] });
            toast.success("File restored!");
        },
    });
}

export function usePermanentDeleteDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const trash = JSON.parse(localStorage.getItem("trash-downloads") || "[]");
            localStorage.setItem(
                "trash-downloads",
                JSON.stringify(trash.filter((d) => d.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-downloads"] });
            toast.success("File permanently deleted!");
        },
    });
}

export function useBulkDeleteDownloads() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(400);
            const list = getSeededDownloads();
            const trash = JSON.parse(localStorage.getItem("trash-downloads") || "[]");
            const itemsToDelete = list.filter((item) => ids.includes(item.id));
            const remaining = list.filter((item) => !ids.includes(item.id));

            persistDownloads(remaining);
            localStorage.setItem("trash-downloads", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads"] });
            queryClient.invalidateQueries({ queryKey: ["trash-downloads"] });
            toast.success("Selected files moved to trash!");
        },
    });
}
