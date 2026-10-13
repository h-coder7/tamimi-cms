"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import { getDefaultPageContent } from "@/components/dashboard/pages/_shared/registry";
import {
  PAGE_SLUG_BY_ID,
  pageFromApi,
  pageStatusToApi,
} from "@/lib/mappers/pages";

export const PAGE_STATUSES = ["Draft", "Published"];

function mergeSectionContent(defaults, stored) {
  const base = { ...(defaults || {}) };
  for (const [key, value] of Object.entries(stored || {})) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    if (Object.keys(value).length === 0) continue;
    base[key] = { ...(base[key] || {}), ...value };
  }
  return base;
}

function withDefaults(item) {
  if (!item) return null;
  return {
    ...item,
    content: mergeSectionContent(getDefaultPageContent(item), item.content),
  };
}

export function useCmsPages() {
  return useQuery({
    queryKey: ["cms-pages"],
    queryFn: async () => {
      const res = await api.get("/pages", {
        params: { page: 1, perPage: 100 },
      });
      return (res.data?.data || []).map((p) => withDefaults(pageFromApi(p)));
    },
  });
}

export function useCmsPage(id) {
  const slug = PAGE_SLUG_BY_ID[Number(id)];
  return useQuery({
    queryKey: ["cms-pages", Number(id)],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await api.get(`/pages/${slug}`);
      return withDefaults(pageFromApi(res.data?.data));
    },
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updated) => {
      const slug = updated.slug || PAGE_SLUG_BY_ID[Number(updated.id)];
      if (!slug) throw new Error("Unknown page");

      const publish =
        pageStatusToApi(updated.status) === "published" ||
        updated.status === "Published";

      const res = await api.put(`/pages/${slug}/content`, {
        sections: updated.content || {},
        publish,
      });
      return withDefaults(pageFromApi(res.data?.data));
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      if (data?.id) {
        await queryClient.invalidateQueries({ queryKey: ["cms-pages", data.id] });
      }
      toast.success("Page content saved!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not save page"));
    },
  });
}
