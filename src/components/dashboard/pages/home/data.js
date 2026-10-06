export const pageMeta = {
    id: 1,
    page: "Home",
    url: "/",
    editable_fields: 36,
    sections: 9,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        headline: "One integrated ecosystem powering Saudi Arabia's energy future",
        supporting_text:
            "End-to-end solutions across Oil & Gas, Power, Water, Industrial Manufacturing, Automation, Engineering Services and Renewable Energy, delivered through a diversified portfolio of specialized companies.",
        primary_btn_label: "Explore Industries We Power",
        primary_btn_link: "/industries",
        secondary_btn_label: "Company Directory",
        secondary_btn_link: "/companies",
        background_video: "",
        fallback_image: "",
    },
    key_message: {
        eyebrow: "Who we are",
        title: "Not a single company. An integrated energy group.",
        paragraph:
            "A member of Tamimi Holding, Tamimi Energy brings together specialized companies that build, supply, manufacture and maintain energy solutions, supporting Saudi Vision 2030, localization and sustainability.",
        point_1_title: "Over 50 years of leadership",
        point_1_text:
            "Founded in 1953 by the late Sheikh Ali bin Abdullah Al Tamimi to execute pipelines and general contracting, the Group has worked in the Saudi energy sector ever since.",
        point_2_title: "The entire energy value chain",
        point_2_text:
            "An integrated group of specialized companies, from supply and manufacturing to services, training and digital solutions.",
        point_3_title: "Made in Saudi Arabia",
        point_3_text:
            "Local manufacturing, innovation and strategic international partnerships for Vision 2030.",
    },
    key_figures: {
        figure_1_value: "50+",
        figure_1_label: "Years of leadership in the energy sector",
        figure_2_value: "18",
        figure_2_label: "Specialized companies and joint ventures",
        figure_3_value: "9",
        figure_3_label: "Industries served across the energy value chain",
        figure_4_value: "",
        figure_4_label: "Major industrial projects delivered",
    },
    industries: {
        section_title: "Serving every stage of the energy value chain",
    },
    our_companies: {
        section_title: "18 specialized companies and joint ventures",
        selected_companies: ["SESCO", "ENERCO", "TCO", "S3C", "GET Water", "SSS"],
    },
    featured_projects: {
        section_title: "Delivering major industrial projects",
    },
    clients_partners: {
        section_title: "Trusted by leading organizations",
    },
    media_center: {
        section_title: "Latest from the Group",
    },
    cta: {
        title: "Looking for an integrated energy partner?",
        button_1_label: "Send an Inquiry",
        button_1_link: "/contact/inquiry",
        button_2_label: "Download Group Profile",
        button_2_link: "/downloads",
    },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
