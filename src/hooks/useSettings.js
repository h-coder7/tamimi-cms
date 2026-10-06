"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const SETTINGS_SEED_VERSION = "tamimi-settings-v2";

export const DEFAULT_SETTINGS = {
    // General / Company
    company_name: "Tamimi Energy Group",
    parent_company: "Tamimi Holding",
    head_office_address:
        "Barandah Building, Intersection of Prince Faisal Bin Fahad Rd. with Prince Humud St., Al Khobar, Kingdom of Saudi Arabia",
    po_box: "P.O. Box 30010, Khobar 31952",
    phone: "+966 13 822 1180 / 82",
    general_email: "info@tamimienergy.com",
    google_maps_link: "https://maps.google.com/",

    // Branches
    branches: [
        {
            id: 1,
            name: "Head office — Al Khobar",
            city: "Al Khobar",
            address:
                "Barandah Building, Intersection of Prince Faisal Bin Fahad Rd. with Prince Humud St., Al Khobar, Kingdom of Saudi Arabia",
            phone: "+966 13 822 1180 / 82",
            email: "info@tamimienergy.com",
        },
    ],

    // Social media
    linkedin: "https://www.linkedin.com/company/tamimienergy",
    twitter: "",
    youtube: "",

    // Form recipients
    contact_form_email: "info@tamimienergy.com",
    inquiry_form_email: "[Pending: inquiry email]",
    careers_email: "[Pending: HR email]",

    // Header & footer
    header_cta_label: "Send an Inquiry",
    footer_copyright: "© 2026 Tamimi Energy Group. All rights reserved.",
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededSettings() {
    const seedVersion = localStorage.getItem("settings_seed_version");

    if (seedVersion !== SETTINGS_SEED_VERSION) {
        localStorage.setItem("app-settings", JSON.stringify(DEFAULT_SETTINGS));
        localStorage.setItem("settings_seed_version", SETTINGS_SEED_VERSION);
        return DEFAULT_SETTINGS;
    }

    const stored = localStorage.getItem("app-settings");
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
}

export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            await delay(400);
            return getSeededSettings();
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newSettings) => {
            await delay(400);
            localStorage.setItem("app-settings", JSON.stringify(newSettings));
            localStorage.setItem("settings_seed_version", SETTINGS_SEED_VERSION);
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Settings saved successfully!");
        },
    });
}
