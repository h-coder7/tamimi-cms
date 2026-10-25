import { GROUP_CODE, GROUP_VALUE } from "@/lib/companyOptions";

export const DOWNLOAD_TYPES = [
  "Company profile",
  "Brochure",
  "Policy",
  "Other",
];

export const DOWNLOAD_STATUSES = ["Draft", "Published"];

const TYPE_TO_API = {
  "Company profile": "company_profile",
  Brochure: "brochure",
  Policy: "policy",
  Other: "other",
};

const TYPE_TO_UI = {
  company_profile: "Company profile",
  brochure: "Brochure",
  policy: "Policy",
  other: "Other",
};

const STATUS_TO_API = {
  Draft: "draft",
  Published: "published",
};

const STATUS_TO_UI = {
  draft: "Draft",
  published: "Published",
};

function localized(value, fallback = "") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.en || value.ar || fallback;
  }
  return fallback;
}

function toLocalized(en, ar) {
  const enText = String(en || "").trim();
  const arText = String(ar || "").trim() || enText;
  return { en: enText, ar: arText };
}

function toOptionalLocalized(en, ar) {
  const enText = String(en || "").trim();
  const arText = String(ar || "").trim();
  if (!enText && !arText) return null;
  return { en: enText || arText, ar: arText || enText };
}

export function downloadFromApi(item) {
  if (!item) return null;

  const isGroup = item.company === GROUP_VALUE || item.company === "group";
  const company_code = isGroup
    ? GROUP_CODE
    : item.companyRef?.shortCode || "";
  const company_label = isGroup
    ? "Tamimi Energy Group"
    : localized(item.companyRef?.name) || company_code || "";

  const file = item.fileUrl || "";
  const fileMissing = item.fileStatus === "missing" || !file;

  return {
    id: item.id,
    title: localized(item.title),
    i18nTitle: item.title,
    title_ar: typeof item.title === "object" ? item.title?.ar || "" : "",
    type: TYPE_TO_UI[item.type] || "Brochure",
    company: isGroup ? GROUP_VALUE : item.company || "",
    company_code,
    company_label,
    file,
    filePath: item.filePath || null,
    cover: item.thumbnailUrl || "",
    coverPath: item.thumbnailPath || null,
    description: localized(item.description, ""),
    description_ar:
      typeof item.description === "object" ? item.description?.ar || "" : "",
    format: file ? "PDF" : "—",
    status: fileMissing
      ? "Pending file"
      : STATUS_TO_UI[item.status] || "Draft",
    publish_status: STATUS_TO_UI[item.status] || "Draft",
    file_status: item.fileStatus || (file ? "ok" : "missing"),
    is_sample: false,
    created_at: item.createdAt ? String(item.createdAt).slice(0, 10) : "",
  };
}

export function downloadToApiPayload(form) {
  const payload = {
    title: toLocalized(form.title, form.title_ar),
    type: TYPE_TO_API[form.type] || "brochure",
    company: form.company || GROUP_VALUE,
    status:
      STATUS_TO_API[form.publish_status] ||
      STATUS_TO_API[form.status] ||
      "draft",
  };

  // UI may show "Pending file" — map to draft for API
  if (payload.status !== "draft" && payload.status !== "published") {
    payload.status = "draft";
  }

  const description = toOptionalLocalized(
    form.description,
    form.description_ar
  );
  if (description) payload.description = description;

  return payload;
}

export function downloadToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(downloadToApiPayload(form)));

  const pdfFile = form.pdfFiles?.[0]?.file;
  if (pdfFile instanceof File) fd.append("file", pdfFile);

  const coverFile = form.coverFiles?.[0]?.file;
  if (coverFile instanceof File) fd.append("thumbnail", coverFile);

  return fd;
}
