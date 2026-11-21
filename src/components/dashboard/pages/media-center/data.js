export const pageMeta = {
    id: 8,
    page: "Media Center",
    url: "/media",
    editable_fields: 5,
    sections: 2,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        title: { en: "News, insights & events", ar: "أخبار ورؤى وفعاليات" },
        intro_text: { en: "Announcements, exhibitions and events from across the Group.", ar: "آخر الأخبار والرؤى والفعاليات والمعارض من مختلف شركات المجموعة." },
        background_image: null,
    },
    posts: {},
};

export default {
    ...pageMeta,
    content: defaultContent,
};
