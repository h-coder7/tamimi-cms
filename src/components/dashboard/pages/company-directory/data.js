export const pageMeta = {
    id: 4,
    page: "Company Directory",
    url: "/companies",
    editable_fields: 2,
    sections: 2,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        title: "18 specialized companies, one integrated group",
        intro_text:
            "Nine wholly owned subsidiaries and nine joint ventures with international partners, each a leader in its field.",
    },
    directory: {},
};

export default {
    ...pageMeta,
    content: defaultContent,
};
