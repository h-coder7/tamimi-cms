/** OpenAPI slug ↔ FE numeric id (Editors still route by id). */
export const PAGE_ID_BY_SLUG = {
  home: 1,
  "group-history": 2,
  industries: 3,
  companies: 4,
  projects: 5,
  clients: 6,
  sustainability: 7,
  media: 8,
  careers: 9,
  downloads: 10,
  contact: 11,
};

export const PAGE_SLUG_BY_ID = Object.fromEntries(
  Object.entries(PAGE_ID_BY_SLUG).map(([slug, id]) => [id, slug])
);

const STATUS_TO_UI = {
  draft: "Draft",
  published: "Published",
};

const STATUS_TO_API = {
  Draft: "draft",
  Published: "published",
};

export function pageFromApi(page) {
  if (!page) return null;
  const slug = page.slug;
  const id = PAGE_ID_BY_SLUG[slug] || null;

  return {
    id,
    slug,
    page: page.name || "",
    url: page.url || "/",
    editable_fields: Number(page.editableFieldCount) || 0,
    sections: Number(page.sectionCount) || 0,
    status: STATUS_TO_UI[page.status] || "Draft",
    last_updated: page.updatedAt
      ? String(page.updatedAt).slice(0, 10)
      : "",
    content: page.sections && typeof page.sections === "object" ? page.sections : {},
  };
}

export function pageStatusToApi(status) {
  return STATUS_TO_API[status] || status;
}
