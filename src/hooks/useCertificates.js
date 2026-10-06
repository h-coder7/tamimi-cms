"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CERTIFICATES_SEED_VERSION = "tamimi-certificates-v2";

export const CERTIFICATE_TYPES = [
    "ISO",
    "Saudi Aramco approval",
    "Other",
];

const computeStatus = (expiry) => {
    if (!expiry) return "Valid";
    const end = new Date(expiry);
    if (Number.isNaN(end.getTime())) return "Valid";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 45) return "Expires in 6 weeks";
    return "Valid";
};

const withCertificateMeta = (item) => {
    const expiry = item.expiry || null;
    return {
        ...item,
        type: item.type || "ISO",
        issuing_body: item.issuing_body || "",
        holder_code: item.holder_code || "",
        expiry,
        image: item.image || "",
        pdf: item.pdf || "",
        publish_status: item.publish_status || "Draft",
        status: item.status_override || computeStatus(expiry),
        is_sample: Boolean(item.is_sample),
        created_at: item.created_at || "2026-03-01",
    };
};

const MOCK_CERTIFICATES = [
    withCertificateMeta({
        id: 1,
        title: "[Sample] ISO 9001:2015 — Quality management",
        type: "ISO",
        issuing_body: "Certification body",
        holder_code: "SESCO",
        expiry: "2027-06-30",
        publish_status: "Published",
        is_sample: true,
    }),
    withCertificateMeta({
        id: 2,
        title: "[Sample] ISO 45001:2018 — Occupational health & safety",
        type: "ISO",
        issuing_body: "Certification body",
        holder_code: "GPDS",
        expiry: "2026-11-15",
        publish_status: "Draft",
        is_sample: true,
    }),
    withCertificateMeta({
        id: 3,
        title: "[Sample] ISO 14001:2015 — Environmental management",
        type: "ISO",
        issuing_body: "Certification body",
        holder_code: "TCO",
        expiry: "2028-02-01",
        publish_status: "Draft",
        is_sample: true,
    }),
    withCertificateMeta({
        id: 4,
        title: "Saudi Aramco approved — GBS scaffolding",
        type: "Saudi Aramco approval",
        issuing_body: "Saudi Aramco",
        holder_code: "RGS",
        expiry: null,
        publish_status: "Published",
        is_sample: false,
    }),
    withCertificateMeta({
        id: 5,
        title: "Saudi Aramco approved — GBS insulation & fireproofing",
        type: "Saudi Aramco approval",
        issuing_body: "Saudi Aramco",
        holder_code: "G3C",
        expiry: null,
        publish_status: "Published",
        is_sample: false,
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededCertificates() {
    const seedVersion = localStorage.getItem("certificates_seed_version");

    if (seedVersion !== CERTIFICATES_SEED_VERSION) {
        localStorage.setItem("certificates", JSON.stringify(MOCK_CERTIFICATES));
        localStorage.setItem("certificates_seed_version", CERTIFICATES_SEED_VERSION);
        return MOCK_CERTIFICATES;
    }

    const stored = localStorage.getItem("certificates");
    return stored ? JSON.parse(stored) : MOCK_CERTIFICATES;
}

function persistCertificates(list) {
    const normalized = list.map(withCertificateMeta);
    localStorage.setItem("certificates", JSON.stringify(normalized));
    return normalized;
}

export function useCertificates() {
    return useQuery({
        queryKey: ["certificates"],
        queryFn: async () => {
            await delay(400);
            return getSeededCertificates().map(withCertificateMeta);
        },
    });
}

export function useTrashCertificates() {
    return useQuery({
        queryKey: ["trash-certificates"],
        queryFn: async () => {
            await delay(250);
            const stored = localStorage.getItem("trash-certificates");
            return stored ? JSON.parse(stored).map(withCertificateMeta) : [];
        },
    });
}

export function useAddCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededCertificates();
            const item = withCertificateMeta({
                ...newItem,
                id: Math.max(0, ...list.map((c) => c.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistCertificates([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            toast.success("Certificate added successfully!");
        },
    });
}

export function useUpdateCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(400);
            const list = getSeededCertificates();
            persistCertificates(
                list.map((item) => (item.id === updated.id ? withCertificateMeta(updated) : item))
            );
            return withCertificateMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            toast.success("Certificate updated successfully!");
        },
    });
}

export function useDeleteCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededCertificates();
            const trash = JSON.parse(localStorage.getItem("trash-certificates") || "[]");
            const item = list.find((c) => c.id === id);
            if (!item) return id;

            persistCertificates(list.filter((c) => c.id !== id));
            localStorage.setItem("trash-certificates", JSON.stringify([item, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            queryClient.invalidateQueries({ queryKey: ["trash-certificates"] });
            toast.success("Certificate moved to trash!");
        },
    });
}

export function useRestoreCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededCertificates();
            const trash = JSON.parse(localStorage.getItem("trash-certificates") || "[]");
            const item = trash.find((c) => c.id === id);
            if (!item) return id;

            persistCertificates([item, ...list]);
            localStorage.setItem(
                "trash-certificates",
                JSON.stringify(trash.filter((c) => c.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            queryClient.invalidateQueries({ queryKey: ["trash-certificates"] });
            toast.success("Certificate restored successfully!");
        },
    });
}

export function usePermanentDeleteCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const trash = JSON.parse(localStorage.getItem("trash-certificates") || "[]");
            localStorage.setItem(
                "trash-certificates",
                JSON.stringify(trash.filter((c) => c.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-certificates"] });
            toast.success("Certificate permanently deleted!");
        },
    });
}

export function useBulkDeleteCertificates() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(400);
            const list = getSeededCertificates();
            const trash = JSON.parse(localStorage.getItem("trash-certificates") || "[]");
            const itemsToDelete = list.filter((item) => ids.includes(item.id));
            const remaining = list.filter((item) => !ids.includes(item.id));

            persistCertificates(remaining);
            localStorage.setItem("trash-certificates", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            queryClient.invalidateQueries({ queryKey: ["trash-certificates"] });
            toast.success("Selected certificates moved to trash!");
        },
    });
}
