"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  seoPageFromApi,
  seoPageToApiPayload,
} from "@/lib/mappers/seo";

export const SEO_HEALTH = ["Good", "Weak", "Missing"];

export const TITLE_MAX = 60;
export const DESC_MAX = 160;

export const computeSeoHealth = (metaTitle = "", metaDescription = "") => {
  const titleLen = String(metaTitle || "").trim().length;
  const descLen = String(metaDescription || "").trim().length;

  if (titleLen === 0 || descLen === 0) return "Missing";
  if (titleLen > TITLE_MAX || descLen > DESC_MAX) return "Weak";
  if (titleLen < 20 || descLen < 50) return "Weak";
  return "Good";
};

export function useSeoPages() {
  return useQuery({
    queryKey: ["seo-pages"],
    queryFn: async () => {
      const res = await api.get("/seo/pages", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map(seoPageFromApi);
    },
  });
}

export function useUpdateSeoPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const slug = updated.pageSlug;
      if (!slug) throw new Error("Unknown SEO page");
      const res = await api.patch(
        `/seo/pages/${slug}`,
        seoPageToApiPayload(updated)
      );
      return seoPageFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seo-pages"] });
      toast.success("SEO settings updated!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update SEO"));
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

/** Call API to regenerate files, then download XML for the admin. */
export async function downloadSitemapXml(pages = []) {
  try {
    const res = await api.post("/seo/sitemap");
    const urlCount = res.data?.data?.urlCount;
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
    toast.success(
      urlCount != null
        ? `sitemap.xml generated (${urlCount} URLs)!`
        : "sitemap.xml generated!"
    );
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not generate sitemap"));
  }
}
