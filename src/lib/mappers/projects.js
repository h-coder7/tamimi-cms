const STATUS_TO_API = {
  Draft: "draft",
  Published: "published",
};

const STATUS_TO_UI = {
  draft: "Draft",
  published: "Published",
};

const VALUE_CHAIN_TO_API = {
  "Engineering & Design": "engineering_design",
  "Manufacturing & Fabrication": "manufacturing_fabrication",
  "Supply & Distribution": "supply_distribution",
  "Installation & Commissioning": "installation_commissioning",
  "Operations & Maintenance": "operations_maintenance",
};

const VALUE_CHAIN_TO_UI = Object.fromEntries(
  Object.entries(VALUE_CHAIN_TO_API).map(([k, v]) => [v, k])
);

function localized(value, fallback = "") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const joined = value
      .map((v) => localized(v, ""))
      .filter(Boolean)
      .join(" ")
      .trim();
    return joined || fallback;
  }
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

export function projectFromApi(project) {
  if (!project) return null;

  const gallery = Array.isArray(project.gallery)
    ? project.gallery
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") return item;
          return item.url || item.videoUrl || item.path || null;
        })
        .filter(Boolean)
    : [];

  return {
    id: project.id,
    title: localized(project.name),
    i18nTitle: project.name,
    slug: project.slug || "",
    client: localized(project.client),
    location: localized(project.location, ""),
    year: project.year ?? null,
    summary: localized(project.summary, ""),
    challenge: localized(project.challenge, ""),
    solution: localized(project.solution, ""),
    result: localized(project.result, ""),
    services: (project.services || []).map((s) => localized(s)).filter(Boolean),
    companyId: project.companyId || null,
    company_code: project.company?.shortCode || "",
    industryId: project.industryId || null,
    industry: localized(project.industry?.name, ""),
    value_chain: (project.valueChainStages || []).map(
      (s) => VALUE_CHAIN_TO_UI[s] || s
    ),
    gallery,
    galleryItems: Array.isArray(project.gallery) ? project.gallery : [],
    cover: project.coverUrl || "",
    coverPath: project.coverPath || null,
    featured: Boolean(project.isFeatured),
    status: STATUS_TO_UI[project.status] || "Draft",
    is_sample: false,
    content_label: "",
    created_at: project.createdAt
      ? String(project.createdAt).slice(0, 10)
      : "",
  };
}

export function projectToApiPayload(form) {
  const payload = {
    name: toLocalized(form.title),
    client: toLocalized(form.client),
    companyId: form.companyId,
    industryId: form.industryId,
    status: STATUS_TO_API[form.status] || "draft",
    isFeatured: Boolean(form.featured),
  };

  const location = toOptionalLocalized(form.location);
  if (location) payload.location = location;

  if (form.year !== undefined && form.year !== null && form.year !== "") {
    payload.year = Number(form.year);
  }

  const summary = toOptionalLocalized(form.summary);
  if (summary) payload.summary = summary;

  const challenge = toOptionalLocalized(form.challenge);
  if (challenge) payload.challenge = challenge;

  const solution = toOptionalLocalized(form.solution);
  if (solution) payload.solution = solution;

  const result = toOptionalLocalized(form.result);
  if (result) payload.result = result;

  if (Array.isArray(form.services)) {
    payload.services = form.services
      .map((s) => toLocalized(s))
      .filter((s) => s.en || s.ar);
  }

  if (Array.isArray(form.value_chain)) {
    payload.valueChainStages = form.value_chain
      .map((s) => VALUE_CHAIN_TO_API[s] || s)
      .filter(Boolean);
  }

  // Keep existing gallery paths / video URLs; new files go as multipart `gallery`
  const kept = [];
  const gallerySource = Array.isArray(form.gallery)
    ? form.gallery
    : Array.isArray(form.galleryItems)
      ? form.galleryItems
      : [];

  for (const item of gallerySource) {
    if (!item) continue;
    if (item.file instanceof File) continue;
    if (typeof item === "string") {
      // public URL — skip; path should come from galleryItems
      continue;
    }
    if (item.path) kept.push({ path: item.path });
    else if (item.videoUrl) kept.push({ videoUrl: item.videoUrl });
  }

  payload.gallery = kept;

  return payload;
}

/** Multipart: JSON payload + cover + gallery files (upload on Save only). */
export function projectToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(projectToApiPayload(form)));

  const coverFile = form.coverFiles?.[0]?.file;
  if (coverFile instanceof File) fd.append("cover", coverFile);

  const galleryFiles = Array.isArray(form.gallery) ? form.gallery : [];
  for (const item of galleryFiles) {
    if (item?.file instanceof File) fd.append("gallery", item.file);
  }

  return fd;
}
