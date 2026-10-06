"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
    getDefaultPageContent,
    getMockPagesList,
} from "@/components/dashboard/pages/_shared/registry";

const PAGES_SEED_VERSION = "tamimi-pages-v33-sustainability-done";

export const PAGE_STATUSES = ["Draft", "Published"];

const withPageMeta = (item) => {
    const base = {
        ...item,
        page: item.page || "",
        url: item.url || "/",
        editable_fields: Number(item.editable_fields) || 0,
        sections: Number(item.sections) || 0,
        status: item.status || "Draft",
        last_updated: item.last_updated || "",
    };

    if (!base.content) {
        base.content = getDefaultPageContent(base);
    }

    return base;
};

const MOCK_PAGES = getMockPagesList().map(withPageMeta);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededPages() {
    const seedVersion = localStorage.getItem("cms_pages_seed_version");

    if (seedVersion !== PAGES_SEED_VERSION) {
        localStorage.setItem("cms_pages", JSON.stringify(MOCK_PAGES));
        localStorage.setItem("cms_pages_seed_version", PAGES_SEED_VERSION);
        return MOCK_PAGES;
    }

    const stored = localStorage.getItem("cms_pages");
    return stored ? JSON.parse(stored).map(withPageMeta) : MOCK_PAGES;
}

function persistPages(list) {
    const normalized = list.map(withPageMeta);
    localStorage.setItem("cms_pages", JSON.stringify(normalized));
    return normalized;
}

export function useCmsPages() {
    return useQuery({
        queryKey: ["cms-pages"],
        queryFn: async () => {
            await delay(350);
            return getSeededPages().map(withPageMeta);
        },
    });
}

export function useCmsPage(id) {
    return useQuery({
        queryKey: ["cms-pages", Number(id)],
        enabled: Boolean(id),
        queryFn: async () => {
            await delay(250);
            const page = getSeededPages().find((item) => item.id === Number(id));
            return page ? withPageMeta(page) : null;
        },
    });
}

export function useUpdateCmsPage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(350);
            const list = getSeededPages();
            const next = list.map((item) =>
                item.id === updated.id
                    ? withPageMeta({
                          ...updated,
                          last_updated: new Date().toISOString().split("T")[0],
                      })
                    : item
            );
            persistPages(next);
            return withPageMeta(updated);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ["cms-pages", data.id] });
            }
            toast.success("Page content saved!");
        },
    });
}
