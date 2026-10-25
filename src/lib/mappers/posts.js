export const POST_CATEGORIES = [
  "Events & Exhibitions",
  "News",
  "Insights",
];

export const POST_STATUSES = ["Draft", "Scheduled", "Published"];

const CATEGORY_TO_API = {
  News: "news",
  Insights: "insights",
  "Events & Exhibitions": "events_exhibitions",
};

const CATEGORY_TO_UI = {
  news: "News",
  insights: "Insights",
  events_exhibitions: "Events & Exhibitions",
};

const STATUS_TO_API = {
  Draft: "draft",
  Scheduled: "scheduled",
  Published: "published",
};

const STATUS_TO_UI = {
  draft: "Draft",
  scheduled: "Scheduled",
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

/** Preserve HTML body as-is (do not trim tags/whitespace inside markup). */
function toLocalizedHtml(value) {
  const html =
    typeof value === "string"
      ? value
      : localized(value, "");
  return { en: html, ar: html };
}

function toOptionalLocalized(value) {
  const text = localized(value, "").trim();
  if (!text) return null;
  return { en: text, ar: text };
}

function toDateOnly(value) {
  if (!value) return null;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function postFromApi(post) {
  if (!post) return null;
  const event = post.event || null;

  return {
    id: post.id,
    title: localized(post.title),
    i18nTitle: post.title,
    slug: post.slug || "",
    summary: localized(post.summary, ""),
    body: localized(post.body, ""),
    category: CATEGORY_TO_UI[post.category] || "News",
    status: STATUS_TO_UI[post.status] || "Draft",
    publish_date: toDateOnly(post.publishAt),
    relatedCompanyId: post.relatedCompanyId || null,
    company_code: post.relatedCompany?.shortCode || "",
    cover: post.coverUrl || "",
    coverPath: post.coverPath || null,
    event_start: event?.startDate || null,
    event_end: event?.endDate || null,
    venue: localized(event?.venue, ""),
    city: localized(event?.city, ""),
    booth: event?.booth || "",
    event_website: event?.website || "",
    event_kind: event?.kind || "event",
    seo_title: localized(post.seo?.metaTitle, ""),
    seo_description: localized(post.seo?.metaDescription, ""),
    is_sample: false,
    created_at: post.createdAt ? String(post.createdAt).slice(0, 10) : "",
  };
}

export function postToApiPayload(form) {
  const category = CATEGORY_TO_API[form.category] || "news";
  const payload = {
    category,
    title: toLocalized(form.title),
    body: toLocalizedHtml(form.body),
    status: STATUS_TO_API[form.status] || "draft",
  };

  const summary = toOptionalLocalized(form.summary);
  if (summary) payload.summary = summary;

  if (form.publish_date) {
    payload.publishAt = `${String(form.publish_date).slice(0, 10)}T00:00:00.000Z`;
  } else if (form.publish_date === null || form.publish_date === "") {
    payload.publishAt = null;
  }

  payload.relatedCompanyId = form.relatedCompanyId || null;

  if (form.seo_title || form.seo_description) {
    payload.seo = {
      metaTitle: toOptionalLocalized(form.seo_title) || undefined,
      metaDescription: toOptionalLocalized(form.seo_description) || undefined,
    };
  }

  if (category === "events_exhibitions") {
    payload.event = {
      kind: form.event_kind === "exhibition" ? "exhibition" : "event",
      startDate: String(form.event_start || "").slice(0, 10),
      endDate: form.event_end
        ? String(form.event_end).slice(0, 10)
        : null,
      venue: toLocalized(form.venue),
      city: toOptionalLocalized(form.city),
      booth: (form.booth || "").trim() || null,
      website: (form.event_website || "").trim() || null,
      participatingCompanyIds: [],
    };
  } else {
    payload.event = null;
  }

  return payload;
}

export function postToFormData(form) {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(postToApiPayload(form)));

  const coverFile = form.coverFiles?.[0]?.file;
  if (coverFile instanceof File) fd.append("cover", coverFile);

  return fd;
}
