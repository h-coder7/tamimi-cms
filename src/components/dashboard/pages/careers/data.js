export const pageMeta = {
    id: 9,
    page: "Careers",
    url: "/careers",
    editable_fields: 14,
    sections: 2,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    section_1: { title: "Careers intro", body: "" },
    why_join_us: { cards: ["users", "briefcase", "graduation-cap", "heart"].map((icon, index) => ({ id: index + 1, icon, title: { en: "", ar: "" }, description: { en: "", ar: "" } })) },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
