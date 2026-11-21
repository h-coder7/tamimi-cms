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
  const selectedStageCount = Array.isArray(industry.valueChainStages)
    ? industry.valueChainStages.length
    : stagesWithCompanies.length;
  const companiesCount = companyIds.length || companies.length;

  return {
    id: industry.id,
    title,
    i18nTitle: industry.name,
    slug: industry.slug,
    order: industry.displayOrder ?? 0,
    status: STATUS_TO_UI[industry.status] || "Draft",
    short_description: shortDescription,
    i18nShortDescription: industry.shortDescription,
    full_description: fullDescription,
    i18nFullDescription: industry.fullDescription,
    relatedIndustryIds: Array.isArray(industry.relatedIndustryIds) ? industry.relatedIndustryIds : [],
    overview: industry.overview || { title: { en: "", ar: "" }, firstDescription: { en: "", ar: "" }, secondDescription: { en: "", ar: "" } },
    description: shortDescription,
    companies,
    companyIds,
    value_chain_mapping: mapping,
    value_chain_stages: Array.isArray(industry.valueChainStages) ? industry.valueChainStages : [],
    value_chain: stagesWithCompanies,
    companies_count: companiesCount,
    companies_label: `${companiesCount} ${companiesCount === 1 ? "company" : "companies"}`,
    stages_count: selectedStageCount,
    stages_label: `${selectedStageCount} of ${TOTAL_STAGES} stages`,
    icon: industry.iconUrl || "",
    cover: industry.coverUrl || "",
    homepageBanner: industry.homepageBannerUrl || industry.coverUrl || "",
    industryCard: industry.industryCardUrl || industry.iconUrl || "",
    homepageBannerUrl: industry.homepageBannerUrl || industry.coverUrl || "",
    industryCardUrl: industry.industryCardUrl || industry.iconUrl || "",
    cover_video_url: industry.coverVideoUrl || "",
    iconPath: industry.iconPath || null,
    coverPath: industry.coverPath || null,
    homepageBannerPath: industry.homepageBannerPath || industry.coverPath || null,
    industryCardPath: industry.industryCardPath || industry.iconPath || null,
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
  const valueChainStages = Array.isArray(form.value_chain_stages) ? form.value_chain_stages : VALUE_CHAIN_STAGES.filter(
    (stage) => Array.isArray(mapping[stage]) && mapping[stage].length > 0
  ).map((stage) => VALUE_CHAIN_TO_API[stage] || stage);

  const payload = {
    name: form.i18nTitle && localized(form.i18nTitle).trim() === String(form.title || "").trim() ? form.i18nTitle : toLocalized(form.title),
    status: STATUS_TO_API[form.status] || "draft",
    shortDescription: form.i18nShortDescription && localized(form.i18nShortDescription).trim() === String(form.short_description || form.description || "").trim() ? form.i18nShortDescription : toLocalized(form.short_description || form.description),
    overview: form.overview,
    fullDescription: form.i18nFullDescription && localized(form.i18nFullDescription).trim() === String(form.full_description || "").trim() ? form.i18nFullDescription : toLocalized(form.full_description),
    relatedIndustryIds: Array.isArray(form.relatedIndustryIds) ? form.relatedIndustryIds : [],
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

  if (form.homepageBannerPath !== undefined) {
    payload.homepageBannerPath = form.homepageBannerPath;
    payload.coverPath = form.homepageBannerPath;
  }
  if (form.industryCardPath !== undefined) payload.industryCardPath = form.industryCardPath;
  if (form.iconPath !== undefined) payload.iconPath = form.iconPath;

  return payload;
}

export function industryToFormData(form, companiesList = []) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(industryToApiPayload(form, companiesList)));

  const bannerFile = form.coverFiles?.[0]?.file || form.homepageBannerFiles?.[0]?.file || form.homepageBannerFile;
  if (bannerFile instanceof File) fd.append("cover", bannerFile);

  const cardFile =
    form.industryCardFiles?.[0]?.file ||
    form.industryCardFile ||
    form.iconFiles?.[0]?.file;
  if (cardFile instanceof File) fd.append("industryCard", cardFile);

  const iconFile = form.iconFiles?.[0]?.file || form.iconFile;
  if (iconFile instanceof File) fd.append("icon", iconFile);

  return fd;
}
