export const pageMeta = {
    id: 11,
    page: "Contact Us",
    url: "/contact",
    editable_fields: 4,
    sections: 3,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    "section_1": {
        "title": "Contact Us intro",
        "body": ""
    },
    "section_2": {
        "title": "Section 2",
        "body": ""
    },
    "section_3": {
        "title": "Section 3",
        "body": ""
    }
};

export default {
    ...pageMeta,
    content: defaultContent,
};
