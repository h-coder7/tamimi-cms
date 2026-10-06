"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const SEO_SEED_VERSION = "tamimi-seo-v1";

export const SEO_HEALTH = ["Good", "Weak", "Missing"];

export const TITLE_MAX = 60;
export const DESC_MAX = 160;

const padText = (text, length) => {
    if (!length) return "";
    if (text.length === length) return text;
    if (text.length > length) return text.slice(0, length);
    const filler = " Integrated energy solutions across Saudi Arabia.";
    let out = text;
    while (out.length < length) {
        out += filler;
    }
    return out.slice(0, length);
};

export const computeSeoHealth = (metaTitle = "", metaDescription = "") => {
    const titleLen = String(metaTitle || "").trim().length;
    const descLen = String(metaDescription || "").trim().length;

    if (titleLen === 0 || descLen === 0) return "Missing";
    if (titleLen > TITLE_MAX || descLen > DESC_MAX) return "Weak";
    if (titleLen < 20 || descLen < 50) return "Weak";
    return "Good";
};

const withSeoMeta = (item) => {
    const meta_title = item.meta_title || "";
    const meta_description = item.meta_description || "";
    return {
        ...item,
        page: item.page || "",
        slug: item.slug || "",
        meta_title,
        meta_description,
        title_length: meta_title.length,
        description_length: meta_description.length,
        health: item.health_override || computeSeoHealth(meta_title, meta_description),
        updated_at: item.updated_at || "2026-03-01",
    };
};

const MOCK_SEO_PAGES = [
    withSeoMeta({
        id: 1,
        page: "Home",
        slug: "/",
        meta_title: "Tamimi Energy Group | Integrated Energy Solutions Saudi Arabia",
        meta_description: padText(
            "Tamimi Energy Group delivers integrated energy solutions across power, oil & gas, water and industrial sectors in Saudi Arabia.",
            148
        ),
    }),
    withSeoMeta({
        id: 2,
        page: "Group History",
        slug: "/group-history",
        meta_title: "Group History | Tamimi Energy Group",
        meta_description: padText(
            "Explore the history of Tamimi Energy Group and decades of growth across the Saudi energy and industrial landscape.",
            132
        ),
    }),
    withSeoMeta({
        id: 3,
        page: "Industries We Power",
        slug: "/industries",
        meta_title: "Industries We Power | Tamimi Energy Group",
        meta_description: "",
    }),
    withSeoMeta({
        id: 4,
        page: "Company Directory",
        slug: "/companies",
        meta_title: "18 Specialized Companies | Tamimi Energy Group",
        meta_description: padText(
            "Browse Tamimi Energy Group’s specialized companies serving power, oil & gas, water, manufacturing and construction.",
            121
        ),
    }),
    withSeoMeta({
        id: 5,
        page: "Project Experience",
        slug: "/projects",
        meta_title: "",
        meta_description: "",
    }),
    withSeoMeta({
        id: 6,
        page: "Sustainability & HSE",
        slug: "/sustainability",
        meta_title: "",
        meta_description: "",
    }),
    withSeoMeta({
        id: 7,
        page: "Careers",
        slug: "/careers",
        meta_title: "Careers | Tamimi Energy Group",
        meta_description: "",
    }),
    withSeoMeta({
        id: 8,
        page: "Contact Us",
        slug: "/contact",
        meta_title: "Contact Us | Tamimi Energy Group",
        meta_description: padText(
            "Contact Tamimi Energy Group for partnership, project and inquiry requests across Saudi Arabia.",
            98
        ),
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededSeoPages() {
    const seedVersion = localStorage.getItem("seo_seed_version");

    if (seedVersion !== SEO_SEED_VERSION) {
        localStorage.setItem("seo_pages", JSON.stringify(MOCK_SEO_PAGES));
        localStorage.setItem("seo_seed_version", SEO_SEED_VERSION);
        return MOCK_SEO_PAGES;
    }

    const stored = localStorage.getItem("seo_pages");
    return stored ? JSON.parse(stored) : MOCK_SEO_PAGES;
}

function persistSeoPages(list) {
    const normalized = list.map(withSeoMeta);
    localStorage.setItem("seo_pages", JSON.stringify(normalized));
    return normalized;
}

export function useSeoPages() {
    return useQuery({
        queryKey: ["seo-pages"],
        queryFn: async () => {
            await delay(350);
            return getSeededSeoPages().map(withSeoMeta);
        },
    });
}

export function useUpdateSeoPage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updated) => {
            await delay(350);
            const list = getSeededSeoPages();
            const next = list.map((item) =>
                item.id === updated.id
                    ? withSeoMeta({
                          ...updated,
                          updated_at: new Date().toISOString().split("T")[0],
                      })
                    : item
            );
            persistSeoPages(next);
            return withSeoMeta(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-pages"] });
            toast.success("SEO settings updated!");
        },
    });
}

export function buildSitemapXml(pages = []) {
    const baseUrl = "https://www.tamimienergy.com";
    const urls = pages
        .map((page) => {
            const loc = `${baseUrl}${page.slug === "/" ? "" : page.slug || ""}`;
            return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === "/" ? "1.0" : "0.7"}</priority>
  </url>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function downloadSitemapXml(pages = []) {
    const xml = buildSitemapXml(pages);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sitemap.xml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("sitemap.xml generated!");
}
