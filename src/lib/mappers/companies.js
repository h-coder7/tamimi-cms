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

export function companyFromApi(company) {
  if (!company) return null;
  const title = localized(company.name);
  const overview = localized(company.overview);
  const website = company.website || "";

  return {
    id: company.id,
    title,
    code: company.shortCode,
    slug: company.slug,
    tagline: localized(company.tagline),
    year_established:
      company.yearEstablished != null ? String(company.yearEstablished) : "",
    overview,
    field: company.field || overview,
    description: overview,
    services: (company.coreServices || [])
      .map((s) => localized(s))
      .filter(Boolean),
    products: (company.featuredProducts || [])
      .map((p) => localized(p))
      .filter(Boolean),
    // titles for table/filter/display; ids for form save
    industries: (company.industries || []).map((i) => localized(i.name)).filter(Boolean),
    industryIds: company.industryIds || (company.industries || []).map((i) => i.id).filter(Boolean),
    industries_count: company.industryCount || (company.industries || []).length || 0,
    industries_label: `${company.industryCount || (company.industries || []).length || 0} industries`,
    value_chain: (company.valueChainStages || []).map(
      (s) => VALUE_CHAIN_TO_UI[s] || s
    ),
    certifications: company.certificates || [],
    gallery: (company.gallery || [])
      .map((g) => g.videoUrl || g.url || "")
      .filter(Boolean),
    video_url: "",
    status: STATUS_TO_UI[company.status] || "Draft",
    type: TYPE_TO_UI[company.type] || "Subsidiary",
    display_order: company.displayOrder ?? "",
    image: company.logoUrl || "",
    cover: company.coverUrl || "",
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
    name: toLocalized(form.title),
    shortCode: (form.code || "").trim(),
    field: (form.field || form.overview || "").trim() || "General",
    overview: toLocalized(form.overview || form.field || form.title),
    type: TYPE_TO_API[form.type] || "subsidiary",
    status: STATUS_TO_API[form.status] || "draft",
  };

  if (form.tagline !== undefined) payload.tagline = toLocalized(form.tagline);
  if (form.year_established)
    payload.yearEstablished = Number(form.year_established) || undefined;
  if (form.type === "Joint Venture") {
    payload.jvPartner = form.jvPartner || null;
  }
  if (Array.isArray(form.services)) {
    payload.coreServices = form.services.map((s) => toLocalized(s));
  }
  if (Array.isArray(form.products)) {
    payload.featuredProducts = form.products.map((p) => toLocalized(p));
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
      metaTitle: toLocalized(form.seo_title),
      metaDescription: toLocalized(form.seo_description),
    };
  }

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

  const brochureFile = form.brochureFiles?.[0]?.file;
  if (brochureFile instanceof File) fd.append("brochure", brochureFile);

  return fd;
}
