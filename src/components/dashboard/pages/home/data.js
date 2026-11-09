export const pageMeta = {
    id: 1,
    page: "Home",
    url: "/",
    editable_fields: 36,
    sections: 7,
    status: "Draft",
    last_updated: "",
};

export const defaultContent = {
    hero: {
        introductory_heading: "One integrated ecosystem powering Saudi Arabia's energy future",
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
        photo: "",
        point_1_title: "50+",
        point_1_text: "Over 50 years of leadership",
        point_2_title: "18",
        point_2_text: "Specialized companies",
        point_3_title: "Made in Saudi Arabia",
        point_3_text:
            "Local manufacturing, innovation and strategic international partnerships for Vision 2030.",
        slides: [
            {
                id: "main-slide",
                title: "Our Integrated Energy Vision",
                description: "Delivering sustainable, innovative solutions across the entire energy value chain.",
                isMain: true,
            },
        ],
    },
    our_values: {
        title: {
            en: "Our Core Values",
            ar: "قيمنا الجوهرية",
        },
        cards: [
            {
                id: 1,
                title: { en: "Integrity", ar: "النزاهة" },
                description: { en: "Operating with honesty, transparency and high ethical standards.", ar: "العمل بنزاهة وشفافية وبأعلى المعايير الأخلاقية." },
                icon: "",
            },
            {
                id: 2,
                title: { en: "Excellence", ar: "التميز" },
                description: { en: "Delivering world-class quality and continuous improvement.", ar: "تقديم جودة عالمية المستوى والتحسين المستمر." },
                icon: "",
            },
            {
                id: 3,
                title: { en: "Innovation", ar: "الابتكار" },
                description: { en: "Pioneering sustainable and forward-looking energy solutions.", ar: "ريادة حلول طاقة مستدامة ومستقبلية." },
                icon: "",
            },
            {
                id: 4,
                title: { en: "Safety", ar: "السلامة" },
                description: { en: "Prioritizing the health and well-being of people and communities.", ar: "وضع صحة وسلامة الأفراد والمجتمعات في مقدمة أولوياتنا." },
                icon: "",
            },
        ],
    },
    industries: {
        section_title: "Serving every stage of the energy value chain",
    },
    our_companies: {
        section_title: "18 specialized companies and joint ventures",
        selected_companies: [],
    },
    saudi_manufacturing: {
        small_heading: {
            en: "Saudi Manufacturing & Localisation",
            ar: "التصنيع والتوطين السعودي",
        },
        main_heading: {
            en: "Building in the Kingdom, for the Kingdom",
            ar: "نبني في المملكة، لأجل المملكة",
        },
        title: {
            en: "Building in the Kingdom, for the Kingdom",
            ar: "نبني في المملكة، لأجل المملكة",
        },
        description: {
            en: "We design, build and localise industrial products and services inside Saudi Arabia, keeping engineering, manufacturing and know-how close to the projects they serve. Our approach supports Vision 2030 by growing local content, creating skilled Saudi jobs and strengthening supply chains.",
            ar: "نصمم ونصنّع ونوطّن المنتجات والخدمات الصناعية داخل المملكة العربية السعودية، مع الحفاظ على القرب من المشاريع التي تخدمها. يدعم نهجنا رؤية 2030 من خلال تنمية المحتوى المحلي وخلق وظائف نوعية وتعزيز سلاسل الإمداد.",
        },
        image: "",
        features: [
            {
                id: 1,
                title: { en: "Local Manufacturing Capacity", ar: "قدرات التصنيع المحلي" },
                icon: "factory",
            },
            {
                id: 2,
                title: { en: "Technology Transfer", ar: "نقل التقنية" },
                icon: "cpu",
            },
            {
                id: 3,
                title: { en: "Saudi Workforce Development", ar: "تطوير الكوادر السعودية" },
                icon: "users",
            },
            {
                id: 4,
                title: { en: "Resilient Local Supply Chains", ar: "سلاسل إمداد محلية مرنة" },
                icon: "truck",
            },
        ],
        cta: {
            description: {
                en: "Looking for a local manufacturing partner? Talk to our team about localising your next industrial project in the Kingdom.",
                ar: "هل تبحث عن شريك تصنيع محلي؟ تواصل مع فريقنا لتوطين مشروعك الصناعي القادم في المملكة.",
            },
            text: { en: "Explore Manufacturing Capabilities", ar: "استكشف قدرات التصنيع" },
            url: "/companies",
        },
    },
    media_center: {
        section_title: "Latest from the Group",
    },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
