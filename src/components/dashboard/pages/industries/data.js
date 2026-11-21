export const pageMeta = {
    id: 3,
    page: "Industries We Power",
    url: "/industries",
    editable_fields: 2,
    sections: 2,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        title: { en: "Powering nine industries across the energy value chain", ar: "نُمكّن تسعة قطاعات عبر سلسلة قيمة الطاقة" },
        intro_text: {
            en: "Our companies work together at every stage, from supplying and manufacturing to servicing and operating the assets that keep the Kingdom running.",
            ar: "تعمل شركاتنا معًا في كل مرحلة، من التوريد والتصنيع إلى خدمة الأصول وتشغيلها لدعم المملكة.",
        },
    },
    industry_cards: {},
    value_chain: {},
};

export default {
    ...pageMeta,
    content: defaultContent,
};
