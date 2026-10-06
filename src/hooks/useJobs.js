"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const JOBS_SEED_VERSION = "tamimi-jobs-v2";

export const JOB_STATUSES = ["Open", "Closed", "Draft"];

const withJobMeta = (item) => ({
    ...item,
    city: item.city || "",
    company_code: item.company_code || "",
    experience: item.experience || "",
    vacancies: Number(item.vacancies) || 0,
    deadline: item.deadline || null,
    applications: Number(item.applications) || 0,
    status: item.status || "Open",
    description: item.description || "",
    requirements: item.requirements || "",
    is_sample: Boolean(item.is_sample),
    created_at: item.created_at || "2026-03-01",
});

const MOCK_JOBS = [
    withJobMeta({
        id: 1,
        title: "[Sample] Electrical Engineer",
        city: "Al Khobar",
        company_code: "SESCO",
        experience: "5+ years",
        vacancies: 2,
        deadline: "2026-10-31",
        applications: 2,
        status: "Open",
        is_sample: true,
        description: "Sample electrical engineer role at SESCO.",
        requirements: "Degree in electrical engineering and relevant site experience.",
    }),
    withJobMeta({
        id: 2,
        title: "[Sample] HSE Officer",
        city: "Dammam",
        company_code: "TEG",
        experience: "3+ years",
        vacancies: 1,
        deadline: "2026-10-20",
        applications: 2,
        status: "Open",
        is_sample: true,
        description: "Sample HSE officer role for Tamimi Energy Group.",
        requirements: "HSE certification and industrial site experience.",
    }),
    withJobMeta({
        id: 3,
        title: "[Sample] Instrument Technician",
        city: "Jubail",
        company_code: "SSS",
        experience: "4+ years",
        vacancies: 3,
        deadline: "2026-11-15",
        applications: 1,
        status: "Open",
        is_sample: true,
        description: "Sample instrument technician role at SSS.",
        requirements: "Instrumentation diploma and calibration experience.",
    }),
    withJobMeta({
        id: 4,
        title: "[Sample] Sales Engineer — Valves",
        city: "Dammam",
        company_code: "OSS",
        experience: "3+ years",
        vacancies: 1,
        deadline: "2026-11-30",
        applications: 0,
        status: "Open",
        is_sample: true,
        description: "Sample sales engineer role for valves at OSS.",
        requirements: "Technical sales background in valves or related products.",
    }),
    withJobMeta({
        id: 5,
        title: "[Sample] Coating Inspector",
        city: "Al Khobar",
        company_code: "S3C",
        experience: "5+ years",
        vacancies: 1,
        deadline: "2026-09-15",
        applications: 1,
        status: "Closed",
        is_sample: true,
        description: "Sample coating inspector role at S3C.",
        requirements: "NACE / coating inspection certification preferred.",
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededJobs() {
    const seedVersion = localStorage.getItem("jobs_seed_version");

    if (seedVersion !== JOBS_SEED_VERSION) {
        localStorage.setItem("jobs", JSON.stringify(MOCK_JOBS));
        localStorage.setItem("jobs_seed_version", JOBS_SEED_VERSION);
        return MOCK_JOBS;
    }

    const stored = localStorage.getItem("jobs");
    return stored ? JSON.parse(stored) : MOCK_JOBS;
}

function persistJobs(list) {
    const normalized = list.map(withJobMeta);
    localStorage.setItem("jobs", JSON.stringify(normalized));
    return normalized;
}

export function useJobs() {
    return useQuery({
        queryKey: ["jobs"],
        queryFn: async () => {
            await delay(400);
            return getSeededJobs().map(withJobMeta);
        },
    });
}

export function useTrashJobs() {
    return useQuery({
        queryKey: ["trash-jobs"],
        queryFn: async () => {
            await delay(250);
            const stored = localStorage.getItem("trash-jobs");
            return stored ? JSON.parse(stored).map(withJobMeta) : [];
        },
    });
}

export function useAddJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItem) => {
            await delay(400);
            const list = getSeededJobs();
            const item = withJobMeta({
                ...newItem,
                id: Math.max(0, ...list.map((j) => j.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistJobs([item, ...list]);
            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            toast.success("Job added successfully!");
        },
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(400);
            const list = getSeededJobs();
            persistJobs(
                list.map((item) => (item.id === updated.id ? withJobMeta(updated) : item))
            );
            return withJobMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            toast.success("Job updated successfully!");
        },
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededJobs();
            const trash = JSON.parse(localStorage.getItem("trash-jobs") || "[]");
            const item = list.find((j) => j.id === id);
            if (!item) return id;

            persistJobs(list.filter((j) => j.id !== id));
            localStorage.setItem("trash-jobs", JSON.stringify([item, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["trash-jobs"] });
            toast.success("Job moved to trash!");
        },
    });
}

export function useRestoreJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const list = getSeededJobs();
            const trash = JSON.parse(localStorage.getItem("trash-jobs") || "[]");
            const item = trash.find((j) => j.id === id);
            if (!item) return id;

            persistJobs([item, ...list]);
            localStorage.setItem(
                "trash-jobs",
                JSON.stringify(trash.filter((j) => j.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["trash-jobs"] });
            toast.success("Job restored successfully!");
        },
    });
}

export function usePermanentDeleteJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(400);
            const trash = JSON.parse(localStorage.getItem("trash-jobs") || "[]");
            localStorage.setItem(
                "trash-jobs",
                JSON.stringify(trash.filter((j) => j.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-jobs"] });
            toast.success("Job permanently deleted!");
        },
    });
}

export function useBulkDeleteJobs() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(400);
            const list = getSeededJobs();
            const trash = JSON.parse(localStorage.getItem("trash-jobs") || "[]");
            const itemsToDelete = list.filter((item) => ids.includes(item.id));
            const remaining = list.filter((item) => !ids.includes(item.id));

            persistJobs(remaining);
            localStorage.setItem("trash-jobs", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["trash-jobs"] });
            toast.success("Selected jobs moved to trash!");
        },
    });
}
