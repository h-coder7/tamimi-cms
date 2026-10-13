import { PAGE_ID_BY_SLUG } from "@/lib/mappers/pages";

const HEALTH_TO_UI = {
  missing: "Missing",
  weak: "Weak",
  good: "Good",
};

const HEALTH_TO_API = {
  Missing: "missing",
  Weak: "weak",
  Good: "good",
};

function localized(value, fallback = "") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  return value.en || value.ar || fallback;
}

function toLocalized(en, ar) {
  const enText = String(en || "").trim();
  const arText = String(ar || "").trim() || enText;
  return { en: enText, ar: arText };
}

export function seoPageFromApi(item) {
  if (!item) return null;
  const pageSlug = item.pageSlug;
  const meta_title = localized(item.metaTitle);
  const meta_description = localized(item.metaDescription);

  return {
    id: PAGE_ID_BY_SLUG[pageSlug] || pageSlug,
    pageSlug,
    page: item.pageName || pageSlug,
    slug: item.urlSlug || "/",
    meta_title,
    meta_title_ar:
      typeof item.metaTitle === "object" ? item.metaTitle?.ar || "" : "",
    meta_description,
    meta_description_ar:
      typeof item.metaDescription === "object"
        ? item.metaDescription?.ar || ""
        : "",
    title_length: Number(item.titleLength) || meta_title.length,
    description_length:
      Number(item.descriptionLength) || meta_description.length,
    health: HEALTH_TO_UI[item.health] || "Missing",
    allow_indexing: item.allowIndexing !== false,
    og_image: item.ogImageUrl || "",
    updated_at: item.updatedAt ? String(item.updatedAt).slice(0, 10) : "",
  };
}

export function seoPageToApiPayload(form) {
  return {
    metaTitle: toLocalized(form.meta_title, form.meta_title_ar),
    metaDescription: toLocalized(
      form.meta_description,
      form.meta_description_ar
    ),
    urlSlug: form.slug,
    allowIndexing:
      form.allow_indexing === undefined ? true : Boolean(form.allow_indexing),
  };
}

export function seoHealthToApi(health) {
  return HEALTH_TO_API[health] || health;
}
