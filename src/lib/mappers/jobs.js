export const JOB_STATUSES = ["Open", "Closed", "Draft"];

export const JOB_CITIES = [
  "Al Khobar",
  "Dammam",
  "Riyadh",
  "Jeddah",
  "Jubail",
];

const STATUS_TO_API = {
  Open: "open",
  Closed: "closed",
  Draft: "draft",
};

const STATUS_TO_UI = {
  open: "Open",
  closed: "Closed",
  draft: "Draft",
};

function localized(value, fallback = "") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.en || value.ar || fallback;
  }
  return fallback;
}

function toLocalized(value) {
  const text = localized(value, "").trim();
  return { en: text, ar: text };
}

function toOptionalLocalized(value) {
  const text = localized(value, "").trim();
  if (!text) return null;
  return { en: text, ar: text };
}

function requirementsFromApi(list) {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list
    .map((item) => localized(item, "").trim())
    .filter(Boolean)
    .join("\n");
}

function requirementsToApi(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [toLocalized("")];
  return lines.map((line) => toLocalized(line));
}

export function jobFromApi(job) {
  if (!job) return null;

  const companyIsGroup = job.company === "group";
  const company_code = companyIsGroup
    ? "TEG"
    : job.companyRef?.shortCode || "";

  return {
    id: job.id,
    title: localized(job.title),
    i18nTitle: job.title,
    slug: job.slug || "",
    city: job.city || "",
    company: job.company || "group",
    company_code,
    experience: localized(job.requiredExperience, ""),
    employment_type: job.employmentType || "",
    vacancies: Number(job.vacancies) || 0,
    description: localized(job.description),
    requirements: requirementsFromApi(job.requirements),
    responsibilities: Array.isArray(job.responsibilities)
      ? job.responsibilities.map((r) => localized(r, "")).filter(Boolean)
      : [],
    status: STATUS_TO_UI[job.status] || "Draft",
    deadline: job.applicationDeadline
      ? String(job.applicationDeadline).slice(0, 10)
      : null,
    applications: Number(job.applicationCount) || 0,
    is_sample: false,
    created_at: job.createdAt ? String(job.createdAt).slice(0, 10) : "",
  };
}

export function jobToApiPayload(form) {
  const payload = {
    title: toLocalized(form.title),
    city: form.city || "Al Khobar",
    company: form.company || "group",
    vacancies: Math.max(1, Number(form.vacancies) || 1),
    description: toLocalized(form.description),
    requirements: requirementsToApi(form.requirements),
    status: STATUS_TO_API[form.status] || "draft",
    applicationDeadline: String(form.deadline || "").slice(0, 10),
  };

  const experience = toOptionalLocalized(form.experience);
  if (experience) payload.requiredExperience = experience;

  if (form.employment_type) {
    payload.employmentType = form.employment_type;
  }

  return payload;
}
