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

function toOptionalLocalized(en, ar) {
  const enText = String(en || "").trim();
  const arText = String(ar || "").trim();
  if (!enText && !arText) return null;
  return { en: enText || arText, ar: arText || enText };
}

/** API nested Settings → FE flat form shape */
export function settingsFromApi(data) {
  if (!data) return null;
  const g = data.general || {};
  const social = data.social || {};
  const recipients = data.formRecipients || {};
  const hf = data.headerFooter || {};

  return {
    company_name: localized(g.companyName),
    company_name_ar:
      typeof g.companyName === "object" ? g.companyName?.ar || "" : "",
    parent_company: localized(g.parentCompany, ""),
    parent_company_ar:
      typeof g.parentCompany === "object" ? g.parentCompany?.ar || "" : "",
    head_office_address: localized(g.headOfficeAddress),
    head_office_address_ar:
      typeof g.headOfficeAddress === "object"
        ? g.headOfficeAddress?.ar || ""
        : "",
    po_box: g.poBox || "",
    phone: g.phone || "",
    general_email: g.generalEmail || "",
    google_maps_link: g.googleMapsLink || "",
    branches: (data.branches || []).map((b, index) => ({
      id: b.id ?? index + 1,
      name: localized(b.name, ""),
      city: b.city || "",
      address: localized(b.address, ""),
      phone: b.phone || "",
      email: b.email || "",
    })),
    linkedin: social.linkedin || "",
    twitter: social.x || "",
    youtube: social.youtube || "",
    contact_form_email: recipients.contactEmail || "",
    inquiry_form_email: recipients.inquiryEmail || "",
    careers_email: recipients.careersEmail || "",
    header_cta_label: localized(hf.headerCtaLabel, ""),
    footer_copyright: localized(hf.footerCopyright, ""),
  };
}

/** FE flat form → API Settings payload */
export function settingsToApiPayload(form) {
  return {
    general: {
      companyName: toLocalized(form.company_name, form.company_name_ar),
      parentCompany: toOptionalLocalized(
        form.parent_company,
        form.parent_company_ar
      ),
      headOfficeAddress: toLocalized(
        form.head_office_address,
        form.head_office_address_ar
      ),
      poBox: String(form.po_box || "").trim() || null,
      phone: String(form.phone || "").trim() || null,
      generalEmail: String(form.general_email || "").trim() || null,
      googleMapsLink: String(form.google_maps_link || "").trim() || null,
    },
    branches: (form.branches || []).map((b) => ({
      id: b.id,
      name: toOptionalLocalized(b.name, b.name),
      address: toOptionalLocalized(b.address, b.address),
      phone: String(b.phone || "").trim() || null,
      email: String(b.email || "").trim() || null,
      city: String(b.city || "").trim() || null,
    })),
    social: {
      linkedin: String(form.linkedin || "").trim() || null,
      x: String(form.twitter || "").trim() || null,
      youtube: String(form.youtube || "").trim() || null,
    },
    formRecipients: {
      contactEmail: String(form.contact_form_email || "").trim(),
      inquiryEmail: String(form.inquiry_form_email || "").trim(),
      careersEmail: String(form.careers_email || "").trim(),
    },
    headerFooter: {
      headerCtaLabel: toOptionalLocalized(
        form.header_cta_label,
        form.header_cta_label
      ),
      footerCopyright: toOptionalLocalized(
        form.footer_copyright,
        form.footer_copyright
      ),
    },
  };
}
