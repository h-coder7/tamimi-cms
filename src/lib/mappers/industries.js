const STATUS_TO_API = {
  Draft: "draft",
  Published: "published",
};

const STATUS_TO_UI = {
  draft: "Draft",
  published: "Published",
};

export const VALUE_CHAIN_STAGES = [
  "Engineering & Design",
  "Manufacturing & Fabrication",
  "Supply & Distribution",
  "Installation & Commissioning",
  "Operations & Maintenance",
];

const VALUE_CHAIN_TO_API = {
  "Engineering & Design": "engineering_design",
  "Manufacturing & Fabrication": "manufacturing_fabrication",
  "Supply & Distribution": "supply_distribution",
  "Installation & Commissioning": "installation_commissioning",
  "Operations & Maintenance": "operations_maintenance",
};

const TOTAL_STAGES = VALUE_CHAIN_STAGES.length;

export const emptyValueChainMapping = () =>
  Object.fromEntries(VALUE_CHAIN_STAGES.map((stage) => [stage, []]));

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

export function industryFromApi(industry) {
  if (!industry) return null;

  const title = localized(industry.name);
  const shortDescription = localized(industry.shortDescription);
  const fullDescription = localized(industry.fullDescription);
  const mapping = {
    ...emptyValueChainMapping(),
    ...(industry.valueChainMapping || {}),
  };

  const companies = Array.isArray(industry.companies)
    ? industry.companies.map((c) => c.shortCode || localized(c.name)).filter(Boolean)
    : [];
  const companyIds = industry.companyIds || industry.companies?.map((c) => c.id) || [];

  const stagesWithCompanies = VALUE_CHAIN_STAGES.filter(
    (stage) => Array.isArray(mapping[stage]) && mapping[stage].length > 0
  );
  const companiesCount = companyIds.length || companies.length;

  return {
    id: industry.id,
    title,
    slug: industry.slug,
    order: industry.displayOrder ?? 0,
    status: STATUS_TO_UI[industry.status] || "Draft",
    short_description: shortDescription,
    full_description: fullDescription,
    description: shortDescription,
    companies,
    companyIds,
    value_chain_mapping: mapping,
    value_chain: stagesWithCompanies,
    companies_count: companiesCount,
    companies_label: `${companiesCount} ${companiesCount === 1 ? "company" : "companies"}`,
    stages_count: stagesWithCompanies.length,
    stages_label: `${stagesWithCompanies.length} of ${TOTAL_STAGES} stages`,
    icon: industry.iconUrl || "",
    cover: industry.coverUrl || "",
    cover_video_url: industry.coverVideoUrl || "",
    iconPath: industry.iconPath || null,
    coverPath: industry.coverPath || null,
    created_at: industry.createdAt
      ? String(industry.createdAt).slice(0, 10)
      : "",
  };
}

/**
 * @param {object} form
 * @param {Array<{id:string,code:string}>} [companiesList] — resolve short codes → UUIDs
 */
export function industryToApiPayload(form, companiesList = []) {
  const codeToId = Object.fromEntries(
    (companiesList || [])
      .filter((c) => c?.code && c?.id)
      .map((c) => [c.code, c.id])
  );

  const companyIds =
    Array.isArray(form.companyIds) && form.companyIds.length
      ? form.companyIds
      : (form.companies || [])
          .map((code) => codeToId[code])
          .filter(Boolean);

  const mapping = form.value_chain_mapping || emptyValueChainMapping();
  const valueChainStages = VALUE_CHAIN_STAGES.filter(
    (stage) => Array.isArray(mapping[stage]) && mapping[stage].length > 0
  ).map((stage) => VALUE_CHAIN_TO_API[stage] || stage);

  const payload = {
    name: toLocalized(form.title),
    status: STATUS_TO_API[form.status] || "draft",
    shortDescription: toLocalized(form.short_description || form.description),
    fullDescription: toLocalized(form.full_description),
    companyIds,
    valueChainStages,
    valueChainMapping: mapping,
  };

  if (
    form.order !== undefined &&
    form.order !== null &&
    form.order !== ""
  ) {
    payload.displayOrder = Number(form.order);
  }

  if (form.cover_video_url !== undefined) {
    payload.coverVideoUrl = (form.cover_video_url || "").trim() || null;
  }

  return payload;
}

export function industryToFormData(form, companiesList = []) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(industryToApiPayload(form, companiesList)));

  const iconFile = form.iconFiles?.[0]?.file;
  if (iconFile instanceof File) fd.append("icon", iconFile);

  const coverFile = form.coverFiles?.[0]?.file;
  if (coverFile instanceof File) fd.append("cover", coverFile);

  return fd;
}
