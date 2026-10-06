export const pageMeta = {
    id: 5,
    page: "Project Experience",
    url: "/projects",
    editable_fields: 2,
    sections: 3,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        title: "Proven delivery on major industrial projects",
        intro_text: "Case studies from across the Group, filterable by industry and company.",
    },
    featured_project: {},
    project_list: {},
};

export default {
    ...pageMeta,
    content: defaultContent,
};
