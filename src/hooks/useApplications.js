"use client";

import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_SEED_VERSION = "tamimi-applications-v2";

const withApplicationMeta = (item) => ({
    ...item,
    name: item.name || "",
    email: item.email || "[Sample] applicant@example.com",
    mobile: item.mobile || "[Sample]",
    city: item.city || "",
    experience_years: item.experience_years ?? null,
    experience_label: item.experience_label || (
        item.experience_years != null ? `${item.experience_years} years` : "—"
    ),
    job_id: item.job_id || null,
    job_title: item.job_title || "",
    applied_at: item.applied_at || null,
    cv: item.cv || "",
    consent: item.consent !== false,
    is_sample: Boolean(item.is_sample),
    created_at: item.created_at || item.applied_at || "2026-03-01",
});

const MOCK_APPLICATIONS = [
    withApplicationMeta({
        id: 1,
        name: "[Sample] Applicant A",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Al Khobar",
        experience_years: 8,
        job_id: 1,
        job_title: "[Sample] Electrical Engineer",
        applied_at: "2026-10-02",
        is_sample: true,
        consent: true,
    }),
    withApplicationMeta({
        id: 2,
        name: "[Sample] Applicant B",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Dammam",
        experience_years: 5,
        job_id: 2,
        job_title: "[Sample] HSE Officer",
        applied_at: "2026-10-02",
        is_sample: true,
        consent: true,
    }),
    withApplicationMeta({
        id: 3,
        name: "[Sample] Applicant C",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Jubail",
        experience_years: 4,
        job_id: 3,
        job_title: "[Sample] Instrument Technician",
        applied_at: "2026-10-01",
        is_sample: true,
        consent: true,
    }),
    withApplicationMeta({
        id: 4,
        name: "[Sample] Applicant D",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Dammam",
        experience_years: 3,
        job_id: 1,
        job_title: "[Sample] Electrical Engineer",
        applied_at: "2026-09-30",
        is_sample: true,
        consent: true,
    }),
    withApplicationMeta({
        id: 5,
        name: "[Sample] Applicant E",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Al Khobar",
        experience_years: 10,
        job_id: 5,
        job_title: "[Sample] Coating Inspector",
        applied_at: "2026-09-12",
        is_sample: true,
        consent: true,
    }),
    withApplicationMeta({
        id: 6,
        name: "[Sample] Applicant F",
        email: "[Sample] applicant@example.com",
        mobile: "[Sample]",
        city: "Riyadh",
        experience_years: 6,
        job_id: 2,
        job_title: "[Sample] HSE Officer",
        applied_at: "2026-09-28",
        is_sample: true,
        consent: true,
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededApplications() {
    const seedVersion = localStorage.getItem("applications_seed_version");

    if (seedVersion !== APPLICATIONS_SEED_VERSION) {
        localStorage.setItem("applications", JSON.stringify(MOCK_APPLICATIONS));
        localStorage.setItem("applications_seed_version", APPLICATIONS_SEED_VERSION);
        return MOCK_APPLICATIONS;
    }

    const stored = localStorage.getItem("applications");
    return stored ? JSON.parse(stored) : MOCK_APPLICATIONS;
}

export function useApplications() {
    return useQuery({
        queryKey: ["applications"],
        queryFn: async () => {
            await delay(400);
            return getSeededApplications()
                .map(withApplicationMeta)
                .sort((a, b) => String(b.applied_at || "").localeCompare(String(a.applied_at || "")));
        },
    });
}
