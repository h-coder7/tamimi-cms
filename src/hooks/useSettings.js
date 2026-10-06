"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// ----------------------------------------------------------------------
// 📦 DEFAULT SETTINGS
// ----------------------------------------------------------------------

const DEFAULT_SETTINGS = {
    websiteName: "CMS",
    keywords: "WR8P1tSli3jz7io7",
    metaDescription: "6AXT8i5B1OOybOHR",
    mailDriver: "smtp",
    mailHost: "skybridgeworld.com",
    mailPort: "587",
    mailUsername: "notification.crm@skybridgeworld.com",
    mailPassword: "",
    mailEncryption: "tls",
    mailFromAddress: "info@cms.com",
    mailFromName: "CMS",
    websitePhone: "123456789",
    websiteEmail: "info@cms.com",
    videoFiles: {} // Map of module name -> { name, url }
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ----------------------------------------------------------------------
// 🚀 HOOKS
// ----------------------------------------------------------------------

export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            // 🚀 When Laravel API is ready:
            // const res = await fetch("https://your-laravel-api.com/api/settings");
            // return res.json();

            await delay(500); // Simulate network
            const stored = localStorage.getItem("app-settings");
            return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newSettings) => {
            // 🚀 When Laravel API is ready:
            // const res = await fetch("https://your-laravel-api.com/api/settings", {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(newSettings)
            // });
            // return res.json();

            await delay(500);
            localStorage.setItem("app-settings", JSON.stringify(newSettings));
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Settings saved successfully!");
        }
    });
}
