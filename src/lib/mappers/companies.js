const TYPE_TO_API = {
  Subsidiary: "subsidiary",
  "Joint Venture": "joint_venture",
};

const TYPE_TO_UI = {
  subsidiary: "Subsidiary",
  joint_venture: "Joint Venture",
};

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
  // Guard against corrupted rows like [[], []]
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

function preserveLocalized(value, original) {
  if (original && typeof original === "object" && !Array.isArray(original) &&
      localized(value, "").trim() === localized(original, "").trim()) return original;
  return toLocalized(value);
}

/** File gallery stays in the uploader; a path-less videoUrl is the YouTube / Vimeo field. */
function splitCompanyGallery(gallery) {
  const source = Array.isArray(gallery) ? gallery : [];
  let video_url = "";
  const extraVideoUrls = [];
  const galleryItems = [];

  for (const item of source) {
    if (!item) continue;
    if (typeof item === "string") {
      galleryItems.push({ url: item, path: null, videoUrl: null });
      continue;
    }
    if (item.videoUrl && !item.path) {
      if (!video_url) video_url = item.videoUrl;
      else extraVideoUrls.push(item.videoUrl);
      continue;
    }
    galleryItems.push(item);
  }

  return {
    gallery: galleryItems
      .map((item) => item.url || item.videoUrl || "")
      .filter(Boolean),
    galleryItems,
    video_url,
    extraVideoUrls,
  };
}

export function companyFromApi(company) {
  if (!company) return null;
  const title = localized(company.name);
  const overview = localized(company.overview);
  const website = company.website || "";

  return {
    id: company.id,
    title,
    i18nTitle: company.name,
    code: company.shortCode,
    slug: company.slug,
    tagline: localized(company.tagline),
    i18nTagline: company.tagline,
    year_established:
      company.yearEstablished != null ? String(company.yearEstablished) : "",
    overview,
    i18nOverview: company.overview,
    secondaryOverview: company.secondaryOverview || { en: "", ar: "" },
    field: company.field || overview,
    description: overview,
    services: (company.coreServices || [])
      .map((s) => localized(s))
      .filter(Boolean),
    i18nServices: company.coreServices || [],
    products: (company.featuredProducts || [])
      .map((p) => localized(p))
      .filter(Boolean),
    i18nProducts: company.featuredProducts || [],
    // titles for table/filter/display; ids for form save
    industries: (company.industries || []).map((i) => localized(i.name)).filter(Boolean),
    industryIds: company.industryIds || (company.industries || []).map((i) => i.id).filter(Boolean),
    industries_count: company.industryCount || (company.industries || []).length || 0,
    industries_label: `${company.industryCount || (company.industries || []).length || 0} industries`,
    value_chain: (company.valueChainStages || []).map(
      (s) => VALUE_CHAIN_TO_UI[s] || s
    ),
    certifications: Array.isArray(company.certifications)
      ? company.certifications.filter((id) => typeof id === "string")
      : [],
    ...splitCompanyGallery(company.gallery),
    gallerySequence: Array.isArray(company.gallery) ? company.gallery : [],
    status: STATUS_TO_UI[company.status] || "Draft",
    type: TYPE_TO_UI[company.type] || "Subsidiary",
    display_order: company.displayOrder ?? "",
    image: company.logoUrl || "",
    cover: company.coverUrl || "",
    secondaryImage: company.secondaryImageUrl || "",
    thirdImage: company.thirdImageUrl || "",
    secondaryImagePath: company.secondaryImagePath || null,
    thirdImagePath: company.thirdImagePath || null,
    brochure: company.brochureUrl || "",
    logoPath: company.logoPath || null,
    coverPath: company.coverPath || null,
    brochurePath: company.brochurePath || null,
    phone: company.phone || "",
    email: company.email || "",
    website,
    domain: website,
    seo_title: localized(company.seo?.metaTitle),
    seo_description: localized(company.seo?.metaDescription),
    i18nSeo: company.seo,
    address: "",
    location: "",
    country: "Saudi Arabia",
    created_at: company.createdAt
      ? String(company.createdAt).slice(0, 10)
      : "",
  };
}

export function companyToApiPayload(form) {
  const payload = {
    name: preserveLocalized(form.title, form.i18nTitle),
    shortCode: (form.code || "").trim(),
    field: (form.field || form.overview || "").trim().slice(0, 120) || "General",
    overview: preserveLocalized(form.overview || form.title, form.i18nOverview),
    type: TYPE_TO_API[form.type] || "subsidiary",
    status: STATUS_TO_API[form.status] || "draft",
  };
  if (form.secondaryOverview !== undefined) payload.secondaryOverview = { en: form.secondaryOverview?.en || "", ar: form.secondaryOverview?.ar || "" };
  if (form.secondaryImagePath && !form.secondaryImageFiles?.length) payload.removeSecondaryImage = true;
  if (form.thirdImagePath && !form.thirdImageFiles?.length) payload.removeThirdImage = true;
  if (form.tagline !== undefined) payload.tagline = preserveLocalized(form.tagline, form.i18nTagline);
  if (form.year_established)
    payload.yearEstablished = Number(form.year_established) || undefined;
  if (form.type === "Joint Venture") {
    payload.jvPartner = form.jvPartner || null;
  }
  if (Array.isArray(form.services)) {
    payload.coreServices = form.services.map((s, index) => preserveLocalized(s, form.i18nServices?.[index]));
  }
  if (Array.isArray(form.products)) {
    payload.featuredProducts = form.products.map((p, index) => preserveLocalized(p, form.i18nProducts?.[index]));
  }
  if (Array.isArray(form.value_chain)) {
    payload.valueChainStages = form.value_chain
      .map((s) => VALUE_CHAIN_TO_API[s] || s)
      .filter(Boolean);
  }
  if (Array.isArray(form.industryIds)) {
    payload.industryIds = form.industryIds.filter(Boolean);
  }
  if (form.phone !== undefined) payload.phone = form.phone || null;
  if (form.email !== undefined) payload.email = form.email || null;
  if (form.website !== undefined) {
    const website = (form.website || "").trim();
    payload.website = website
      ? website.startsWith("http")
        ? website
        : `https://${website}`
      : null;
  }
  if (
    form.display_order !== undefined &&
    form.display_order !== null &&
    form.display_order !== ""
  ) {
    payload.displayOrder = Number(form.display_order);
  }
  if (form.seo_title || form.seo_description) {
    payload.seo = {
      ...(form.i18nSeo || {}),
      metaTitle: preserveLocalized(form.seo_title, form.i18nSeo?.metaTitle),
      metaDescription: preserveLocalized(form.seo_description, form.i18nSeo?.metaDescription),
    };
  }

  if (Array.isArray(form.certifications)) {
    payload.certifications = form.certifications.filter(Boolean);
  }

  // Keep existing gallery paths; new files go as multipart `gallery`.
  // The YouTube / Vimeo field is one gallery item with videoUrl and no path.
  const kept = [];
  const gallerySource = Array.isArray(form.gallery)
    ? form.gallery
    : Array.isArray(form.galleryItems)
      ? form.galleryItems
      : [];

  for (const item of gallerySource) {
    if (!item || item.file instanceof File) continue;
    if (typeof item === "string") continue;
    if (item.path) kept.push({ path: item.path, ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}) });
  }

  const videoUrl = String(form.video_url || "").trim();
  if (videoUrl) kept.push({ videoUrl });
  for (const url of form.extraVideoUrls || []) if (url) kept.push({ videoUrl: url });
  // Retain the relative positions of existing files and video links. Newly
  // uploaded files are appended by the API after these retained entries.
  const remaining = [...kept];
  const ordered = [];
  let videoIndex = 0;
  const videos = [videoUrl, ...(form.extraVideoUrls || [])];
  for (const original of form.gallerySequence || []) {
    if (original?.path) {
      const index = remaining.findIndex((item) => item.path === original.path);
      if (index >= 0) ordered.push(...remaining.splice(index, 1));
    } else if (original?.videoUrl) {
      const url = videos[videoIndex++];
      if (url) {
        const index = remaining.findIndex((item) => !item.path && item.videoUrl === url);
        if (index >= 0) ordered.push(...remaining.splice(index, 1));
      }
    }
  }
  payload.gallery = [...ordered, ...remaining];

  return payload;
}

/** Build multipart body: JSON payload + optional files. Upload happens only here (on Save). */
export function companyToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(companyToApiPayload(form)));

  const logoFile = form.logoFiles?.[0]?.file;
  if (logoFile instanceof File) fd.append("logo", logoFile);

  const coverFile = form.coverFiles?.[0]?.file;
  if (coverFile instanceof File) fd.append("cover", coverFile);

  const secondaryImageFile = form.secondaryImageFiles?.[0]?.file;
  if (secondaryImageFile instanceof File) fd.append("secondaryImage", secondaryImageFile);
  const thirdImageFile = form.thirdImageFiles?.[0]?.file;
  if (thirdImageFile instanceof File) fd.append("thirdImage", thirdImageFile);

  const brochureFile = form.brochureFiles?.[0]?.file;
  if (brochureFile instanceof File) fd.append("brochure", brochureFile);

  const galleryFiles = Array.isArray(form.gallery) ? form.gallery : [];
  for (const item of galleryFiles) {
    if (item?.file instanceof File) fd.append("gallery", item.file);
  }

  return fd;
}
