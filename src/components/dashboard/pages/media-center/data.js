export const pageMeta = {
    id: 8,
    page: "Media Center",
    url: "/media",
    editable_fields: 2,
    sections: 2,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    "section_1": {
        "title": "Media Center intro",
        "body": ""
    },
    "section_2": {
        "title": "Section 2",
        "body": ""
    }
};

export default {
    ...pageMeta,
    content: defaultContent,
};
