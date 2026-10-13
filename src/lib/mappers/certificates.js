export const CERTIFICATE_TYPES = [
  "ISO",
  "Saudi Aramco approval",
  "Other",
];

const TYPE_TO_API = {
  ISO: "iso",
  "Saudi Aramco approval": "saudi_aramco_approval",
  Other: "other",
};

const TYPE_TO_UI = {
  iso: "ISO",
  saudi_aramco_approval: "Saudi Aramco approval",
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

const VALIDITY_TO_UI = {
  no_expiry: "Valid",
  valid: "Valid",
  expiring_soon: "Expires in 6 weeks",
  expired: "Expired",
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

export function certificateFromApi(cert) {
  if (!cert) return null;

  const holderIsGroup = cert.holder === "group";
  const holder_code = holderIsGroup
    ? "TEG"
    : cert.holderCompany?.shortCode || "";

  return {
    id: cert.id,
    title: localized(cert.name),
    type: TYPE_TO_UI[cert.type] || "ISO",
    issuing_body: localized(cert.issuingBody, ""),
    holder: cert.holder,
    holder_code,
    expiry: cert.expiryDate || null,
    image: cert.imageUrl || "",
    imagePath: cert.imagePath || null,
    pdf: cert.pdfUrl || "",
    pdfPath: cert.pdfPath || null,
    publish_status: STATUS_TO_UI[cert.status] || "Draft",
    status: VALIDITY_TO_UI[cert.validity] || "Valid",
    validity: cert.validity || "no_expiry",
    is_sample: false,
    created_at: cert.createdAt ? String(cert.createdAt).slice(0, 10) : "",
  };
}

export function certificateToApiPayload(form) {
  const payload = {
    name: toLocalized(form.title),
    type: TYPE_TO_API[form.type] || "iso",
    holder: form.holder || "group",
    status: STATUS_TO_API[form.publish_status] || "draft",
  };

  const issuingBody = toOptionalLocalized(form.issuing_body);
  if (issuingBody) payload.issuingBody = issuingBody;

  if (form.expiry === null || form.expiry === "") {
    payload.expiryDate = null;
  } else if (form.expiry) {
    payload.expiryDate = String(form.expiry).slice(0, 10);
  }

  return payload;
}

export function certificateToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(certificateToApiPayload(form)));

  const imageFile = form.imageFiles?.[0]?.file;
  if (imageFile instanceof File) fd.append("image", imageFile);

  const pdfFile = form.pdfFiles?.[0]?.file;
  if (pdfFile instanceof File) fd.append("pdf", pdfFile);

  return fd;
}
