"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CLIENTS_SEED_VERSION = "tamimi-clients-partners-v2";

export const PARTNER_TYPES = [
    "Client",
    "Strategic partner",
    "Technology alliance",
];

const withPartnerMeta = (item) => ({
    ...item,
    type: item.type || "Client",
    industry: item.industry || "",
    website: item.website || "",
    logo: item.logo || "",
    status: item.status || "Draft",
    display_order: Number(item.display_order) || 1,
    is_sample: item.is_sample !== false,
    created_at: item.created_at || "2026-03-01",
});

const MOCK_PARTNERS = [
    withPartnerMeta({
        id: 1,
        title: "[Sample] Client 01",
        industry: "Oil & Gas",
        type: "Client",
        website: "https://",
        logo: "/images/companies/1.svg",
        display_order: 1,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 2,
        title: "[Sample] Client 02",
        industry: "Power Generation",
        type: "Client",
        website: "https://",
        logo: "/images/companies/2.svg",
        display_order: 2,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 3,
        title: "[Sample] Client 03",
        industry: "Utilities",
        type: "Client",
        website: "https://",
        logo: "/images/companies/3.svg",
        display_order: 3,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 4,
        title: "[Sample] Client 04",
        industry: "Petrochemicals",
        type: "Client",
        website: "https://",
        logo: "/images/companies/4.svg",
        display_order: 4,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 5,
        title: "[Sample] Client 05",
        industry: "Water & Desalination",
        type: "Client",
        website: "https://",
        logo: "/images/companies/5.svg",
        display_order: 5,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 6,
        title: "[Sample] Strategic partner 06",
        industry: "Industrial Manufacturing",
        type: "Strategic partner",
        website: "https://",
        logo: "/images/companies/6.svg",
        display_order: 6,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 7,
        title: "[Sample] Strategic partner 07",
        industry: "Oil & Gas",
        type: "Strategic partner",
        website: "https://",
        logo: "/images/companies/7.svg",
        display_order: 7,
        is_sample: true,
        status: "Draft",
    }),
    withPartnerMeta({
        id: 8,
        title: "[Sample] Technology alliance 08",
        industry: "Automation & Digital Solutions",
        type: "Technology alliance",
        website: "https://",
        logo: "/images/companies/8.svg",
        display_order: 8,
        is_sample: true,
        status: "Draft",
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededPartners() {
    const seedVersion = localStorage.getItem("clients_partners_seed_version");

    if (seedVersion !== CLIENTS_SEED_VERSION) {
        localStorage.setItem("clients_partners", JSON.stringify(MOCK_PARTNERS));
        localStorage.setItem("clients_partners_seed_version", CLIENTS_SEED_VERSION);
        return MOCK_PARTNERS;
    }

    const stored = localStorage.getItem("clients_partners");
    return stored ? JSON.parse(stored) : MOCK_PARTNERS;
}

function persistPartners(list) {
    const normalized = list.map(withPartnerMeta);
    localStorage.setItem("clients_partners", JSON.stringify(normalized));
    return normalized;
}

export function useClientsPartners() {
    return useQuery({
        queryKey: ["clients-partners"],
        queryFn: async () => {
            await delay(400);
            return getSeededPartners()
                .map(withPartnerMeta)
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        },
    });
}

export function useTrashClientsPartners() {
    return useQuery({
        queryKey: ["trash-clients-partners"],
        queryFn: async () => {
            await delay(250);
            const stored = localStorage.getItem("trash-clients-partners");
            return stored ? JSON.parse(stored).map(withPartnerMeta) : [];
        },
    });
}

export function useAddClientPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededPartners();
            const item = withPartnerMeta({
                ...newItem,
                id: Math.max(0, ...list.map((p) => p.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistPartners([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients-partners"] });
            toast.success("Logo added successfully!");
        },
    });
}

export function useUpdateClientPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(400);
            const list = getSeededPartners();
            persistPartners(
                list.map((item) => (item.id === updated.id ? withPartnerMeta(updated) : item))
            );
            return withPartnerMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients-partners"] });
            toast.success("Logo updated successfully!");
        },
    });
}

export function useDeleteClientPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededPartners();
            const trash = JSON.parse(localStorage.getItem("trash-clients-partners") || "[]");
            const item = list.find((p) => p.id === id);
            if (!item) return id;

            persistPartners(list.filter((p) => p.id !== id));
            localStorage.setItem("trash-clients-partners", JSON.stringify([item, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients-partners"] });
            queryClient.invalidateQueries({ queryKey: ["trash-clients-partners"] });
            toast.success("Logo moved to trash!");
        },
    });
}

export function useRestoreClientPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededPartners();
            const trash = JSON.parse(localStorage.getItem("trash-clients-partners") || "[]");
            const item = trash.find((p) => p.id === id);
            if (!item) return id;

            persistPartners([item, ...list]);
            localStorage.setItem(
                "trash-clients-partners",
                JSON.stringify(trash.filter((p) => p.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients-partners"] });
            queryClient.invalidateQueries({ queryKey: ["trash-clients-partners"] });
            toast.success("Logo restored successfully!");
        },
    });
}

export function usePermanentDeleteClientPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const trash = JSON.parse(localStorage.getItem("trash-clients-partners") || "[]");
            localStorage.setItem(
                "trash-clients-partners",
                JSON.stringify(trash.filter((p) => p.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-clients-partners"] });
            toast.success("Logo permanently deleted!");
        },
    });
}
