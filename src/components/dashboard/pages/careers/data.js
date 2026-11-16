export const pageMeta = {
    id: 9,
    page: "Careers",
    url: "/careers",
    editable_fields: 28,
    sections: 4,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    section_1: { title: "Careers intro", body: "" },
    how_to_join: { cards: ["users", "briefcase", "graduation-cap", "heart"].map((icon, index) => ({ id: index + 1, icon, title: { en: "", ar: "" }, description: { en: "", ar: "" } })) },
    graduates_training: { title: { en: "", ar: "" }, description: { en: "", ar: "" } },
    why_join_us: { cards: ["users", "briefcase", "graduation-cap", "heart"].map((icon, index) => ({ id: index + 1, icon, title: { en: "", ar: "" }, description: { en: "", ar: "" } })) },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
