export const pageMeta = {
    id: 3,
    page: "Industries We Power",
    url: "/industries",
    editable_fields: 3,
    sections: 3,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        title: "Powering nine industries across the energy value chain",
        intro_text:
            "Our companies work together at every stage, from supplying and manufacturing to servicing and operating the assets that keep the Kingdom running.",
    },
    value_chain: {
        section_title: "The value chain we cover",
    },
    industry_cards: {},
};

export default {
    ...pageMeta,
    content: defaultContent,
};
