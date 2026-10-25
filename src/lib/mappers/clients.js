const TYPE_TO_API = {
  Client: "client",
  "Strategic partner": "strategic_partner",
  "Technology alliance": "technology_alliance",
};

const TYPE_TO_UI = {
  client: "Client",
  strategic_partner: "Strategic partner",
  technology_alliance: "Technology alliance",
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

function toLocalized(value) {
  const text = localized(value, "").trim();
  return { en: text, ar: text };
}

export function clientFromApi(client) {
  if (!client) return null;
  return {
    id: client.id,
    title: localized(client.name),
    i18nTitle: client.name,
    type: TYPE_TO_UI[client.type] || "Client",
    industryId: client.industryId || null,
    industry: localized(client.industry?.name, ""),
    website: client.website || "",
    logo: client.logoUrl || "",
    logoPath: client.logoPath || null,
    status: STATUS_TO_UI[client.status] || "Draft",
    display_order: client.displayOrder ?? 1,
    is_sample: false,
    created_at: client.createdAt
      ? String(client.createdAt).slice(0, 10)
      : "",
  };
}

export function clientToApiPayload(form) {
  const payload = {
    name: toLocalized(form.title),
    type: TYPE_TO_API[form.type] || "client",
    status: STATUS_TO_API[form.status] || "draft",
    industryId: form.industryId || null,
    website: (form.website || "").trim() || null,
  };

  if (
    form.display_order !== undefined &&
    form.display_order !== null &&
    form.display_order !== ""
  ) {
    payload.displayOrder = Number(form.display_order);
  }

  return payload;
}

export function clientToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(clientToApiPayload(form)));

  const logoFile = form.logoFiles?.[0]?.file;
  if (logoFile instanceof File) fd.append("logo", logoFile);

  return fd;
}
