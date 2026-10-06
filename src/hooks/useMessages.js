"use client";

import { useQuery } from "@tanstack/react-query";

const MESSAGES_SEED_VERSION = "tamimi-messages-v1";

export const MESSAGE_TYPES = ["Inquiry", "Contact"];
export const MESSAGE_STATUSES = ["New", "Read"];

const withMessageMeta = (item) => ({
    ...item,
    name: item.name || "",
    email: item.email || "",
    mobile: item.mobile || "",
    type: item.type || "Inquiry",
    company_code: item.company_code || "",
    company_label: item.company_label || item.company_code || "",
    subject: item.subject || "",
    body: item.body || "",
    received_at: item.received_at || null,
    status: item.status || "New",
    is_sample: Boolean(item.is_sample),
    created_at: item.created_at || item.received_at || "2026-03-01",
});

const MOCK_MESSAGES = [
    withMessageMeta({
        id: 1,
        name: "[Sample] Faisal Al-Harbi",
        email: "faisal@example.com",
        mobile: "[Sample]",
        type: "Inquiry",
        company_code: "SESCO",
        company_label: "SESCO",
        subject: "[Sample] Supply of MV switchgear",
        body: "Sample inquiry about MV switchgear supply for an industrial project.",
        received_at: "2026-10-03",
        status: "New",
        is_sample: true,
    }),
    withMessageMeta({
        id: 2,
        name: "[Sample] Noura Al-Qahtani",
        email: "noura@example.com",
        mobile: "[Sample]",
        type: "Inquiry",
        company_code: "GET Water",
        company_label: "GET Water",
        subject: "[Sample] Mobile desalination unit rental",
        body: "Sample inquiry about mobile desalination unit rental.",
        received_at: "2026-10-02",
        status: "New",
        is_sample: true,
    }),
    withMessageMeta({
        id: 3,
        name: "[Sample] Omar Haddad",
        email: "omar@example.com",
        mobile: "[Sample]",
        type: "Contact",
        company_code: "TEG",
        company_label: "Tamimi Energy Group",
        subject: "[Sample] Partnership request",
        body: "Sample partnership request addressed to Tamimi Energy Group.",
        received_at: "2026-10-02",
        status: "New",
        is_sample: true,
    }),
    withMessageMeta({
        id: 4,
        name: "[Sample] Khalid Al-Mutairi",
        email: "khalid@example.com",
        mobile: "[Sample]",
        type: "Inquiry",
        company_code: "ENERCO",
        company_label: "ENERCO",
        subject: "[Sample] Temporary power for a construction site",
        body: "Sample inquiry about temporary power rental for a construction site.",
        received_at: "2026-09-29",
        status: "Read",
        is_sample: true,
    }),
    withMessageMeta({
        id: 5,
        name: "[Sample] Huda Al-Shehri",
        email: "huda@example.com",
        mobile: "[Sample]",
        type: "Inquiry",
        company_code: "OSS",
        company_label: "OSS",
        subject: "[Sample] Ball valves quotation",
        body: "Sample inquiry requesting a quotation for ball valves.",
        received_at: "2026-09-27",
        status: "Read",
        is_sample: true,
    }),
    withMessageMeta({
        id: 6,
        name: "[Sample] Lama Al-Dosari",
        email: "lama@example.com",
        mobile: "[Sample]",
        type: "Contact",
        company_code: "TEG",
        company_label: "Tamimi Energy Group",
        subject: "[Sample] Media inquiry",
        body: "Sample media inquiry for Tamimi Energy Group.",
        received_at: "2026-09-25",
        status: "Read",
        is_sample: true,
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededMessages() {
    const seedVersion = localStorage.getItem("messages_seed_version");

    if (seedVersion !== MESSAGES_SEED_VERSION) {
        localStorage.setItem("messages", JSON.stringify(MOCK_MESSAGES));
        localStorage.setItem("messages_seed_version", MESSAGES_SEED_VERSION);
        return MOCK_MESSAGES;
    }

    const stored = localStorage.getItem("messages");
    return stored ? JSON.parse(stored) : MOCK_MESSAGES;
}

export function useMessages() {
    return useQuery({
        queryKey: ["messages"],
        queryFn: async () => {
            await delay(400);
            return getSeededMessages()
                .map(withMessageMeta)
                .sort((a, b) => String(b.received_at || "").localeCompare(String(a.received_at || "")));
        },
    });
}
