export const pageMeta = {
    id: 1,
    page: "Home",
    url: "/",
    editable_fields: 70,
    sections: 10,
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
                icon: "/images/values/integrity.svg",
            },
            {
                id: 2,
                title: { en: "Quality", ar: "الجودة" },
                description: { en: "Maintaining high standards in every product and service.", ar: "الحفاظ على معايير عالية في كل منتج وخدمة." },
                icon: "/images/values/quality.svg",
            },
            {
                id: 3,
                title: { en: "Customer Focus", ar: "التركيز على العميل" },
                description: { en: "Listen carefully and build lasting customer relationships.", ar: "نصغي باهتمام ونبني علاقات طويلة الأمد مع عملائنا." },
                icon: "/images/values/customer-focus.svg",
            },
            {
                id: 4,
                title: { en: "Innovation", ar: "الابتكار" },
                description: { en: "Apply knowledge and technology to solve practical challenges.", ar: "نوظف المعرفة والتقنية لحل التحديات العملية." },
                icon: "/images/values/innovation.svg",
            },
            { id: 5, title: { en: "Growth", ar: "النمو" }, description: { en: "Develop our people, capabilities and long-term partnerships.", ar: "نطور كوادرنا وقدراتنا وشراكاتنا طويلة الأمد." }, icon: "/images/values/growth.svg" },
            { id: 6, title: { en: "Respect", ar: "الاحترام" }, description: { en: "Valuing people, communities and the perspectives they bring.", ar: "تقدير الأفراد والمجتمعات ووجهات النظر التي يقدمونها." }, icon: "/images/values/respect.svg" },
        ],
    },
    industries: {
        section_title: "Serving every stage of the energy value chain",
        intro_text: { en: "", ar: "" },
    },
    our_history: {
        heading: {
            small_label: {
                en: "Our history",
                ar: "تاريخنا",
            },
            main_title: {
                en: "50+ years of continuous evolution",
                ar: "أكثر من 50 عامًا من التطور المستمر",
            },
        },
        eras: [
            {
                id: "era-1",
                from_year: 1942,
                to_year: 1971,
                name: {
                    en: "Foundation",
                    ar: "التأسيس",
                },
                description: {
                    en: "Founded by the late Sheikh Ali bin Abdullah Al Tamimi to execute pipelines and general contracting, with SESCO added as the first specialised company.",
                    ar: "تأسست على يد المغفور له بإذن الله الشيخ علي بن عبد الله التميمي لتنفيذ خطوط الأنابيب والمقاولات العامة، مع انضمام سيسكو كأول شركة متخصصة.",
                },
                images: [],
            },
            {
                id: "era-2",
                from_year: 1984,
                to_year: 2003,
                name: {
                    en: "Specialisation",
                    ar: "التخصص",
                },
                description: {
                    en: "Clariant Al-Tamimi, S3C, TCO and ENERCO formed over two decades, each holding a distinct technical remit inside the growing group.",
                    ar: "تأسست كلاريانت التميمي، وS3C، وTCO، وإنيركو على مدى عقدين، لتمتلك كل منها اختصاصًا فنيًا بارزًا ضمن المجموعة المتنامية.",
                },
                images: [],
            },
            {
                id: "era-3",
                from_year: 2006,
                to_year: 2016,
                name: {
                    en: "Group formation",
                    ar: "تشكيل المجموعة",
                },
                description: {
                    en: "Automation, sensing and water capability added, then Tamimi Energy Holding established in 2016 to hold and manage the subsidiaries as one group.",
                    ar: "إضافة قدرات الأتمتة والاستشعار والمياه، ثم تأسيس التميمي للطاقة القابضة في عام 2016 لإدارة الشركات التابعة كمجموعة موحدة.",
                },
                images: [],
            },
            {
                id: "era-4",
                from_year: 2018,
                to_year: 2026,
                name: {
                    en: "Partnership & expansion",
                    ar: "الشراكة والتوسع",
                },
                description: {
                    en: "Scaffolding, measurement and construction companies added, followed by international joint ventures bringing licensed technology into Saudi execution.",
                    ar: "إضافة شركات السقالات والقياس والإنشاءات، تلتها مشاريع مشتركة دولية لجلب التقنيات المرخصة للتنفيذ داخل المملكة.",
                },
                images: [],
            },
        ],
        timeline_years: [
            {
                id: "year-1942",
                year: 1942,
                label: {
                    en: "The beginning",
                    ar: "البداية",
                },
                description: {
                    en: "The late Sheikh Ali bin Abdullah Al Tamimi enters business by founding a company to execute pipelines and related general contracting work.",
                    ar: "دخل المغفور له بإذن الله الشيخ علي بن عبد الله التميمي عالم الأعمال بتأسيس شركة لتنفيذ خطوط الأنابيب وأعمال المقاولات العامة المرتبطة بها.",
                },
            },
            {
                id: "year-1953",
                year: 1953,
                label: {
                    en: "Expansion",
                    ar: "التوسع",
                },
                description: {
                    en: "First major infrastructure contracts secured in the Eastern Province, establishing lasting energy industry relationships.",
                    ar: "الفوز بأول عقود بنية تحتية كبرى في المنطقة الشرقية، وتأسيس علاقات راسخة في قطاع الطاقة.",
                },
            },
            {
                id: "year-1985",
                year: 1985,
                label: {
                    en: "S3C joins the Group",
                    ar: "انضمام S3C إلى المجموعة",
                },
                description: {
                    en: "S3C is added to the Group.",
                    ar: "انضمام S3C إلى المجموعة.",
                },
            },
            {
                id: "year-1984",
                year: 1984,
                label: {
                    en: "Industrial services",
                    ar: "الخدمات الصناعية",
                },
                description: {
                    en: "Specialised industrial chemical and service partnerships launched to support growing national petrochemical infrastructure.",
                    ar: "إطلاق شراكات متخصصة في الكيماويات والخدمات الصناعية لدعم البنية التحتية الوطنية المتنامية للبتروكيماويات.",
                },
            },
            {
                id: "year-2003",
                year: 2003,
                label: {
                    en: "New sectors",
                    ar: "قطاعات جديدة",
                },
                description: {
                    en: "Diversification into power generation, instrumentation, calibration and automation services across Saudi Arabia.",
                    ar: "التنويع نحو توليد الطاقة والأجهزة والمعايرة وخدمات الأتمتة في جميع أنحاء المملكة.",
                },
            },
            {
                id: "year-2016",
                year: 2016,
                label: {
                    en: "Holding structure",
                    ar: "الهيكل القابض",
                },
                description: {
                    en: "Tamimi Energy Holding formally created to unify governance, strategic investment, and group-level commercial operations.",
                    ar: "التأسيس الرسمي لشركة التميمي للطاقة القابضة لتوحيد الحوكمة والاستثمار الاستراتيجي والعمليات التجارية للمجموعة.",
                },
            },
            { id: "year-1993", year: 1993, label: { en: "TCO joins the Group", ar: "انضمام TCO إلى المجموعة" }, description: { en: "TCO is added to the Group.", ar: "انضمام TCO إلى المجموعة." } },
            { id: "year-2006", year: 2006, label: { en: "GPDS joins the Group", ar: "انضمام GPDS إلى المجموعة" }, description: { en: "GPDS is added to the Group.", ar: "انضمام GPDS إلى المجموعة." } },
            { id: "year-2007", year: 2007, label: { en: "Automation, sensing and water", ar: "الأتمتة والاستشعار والمياه" }, description: { en: "Saudi Sensing, GET Water and Automation Solutions Saudi Arabia join the Group.", ar: "انضمام Saudi Sensing وGET Water وAutomation Solutions Saudi Arabia إلى المجموعة." } },
            { id: "year-2018", year: 2018, label: { en: "Resa-Gulf Scaffolding joins", ar: "انضمام Resa-Gulf Scaffolding" }, description: { en: "Resa-Gulf Scaffolding is added to the Group.", ar: "انضمام Resa-Gulf Scaffolding إلى المجموعة." } },
            { id: "year-2021", year: 2021, label: { en: "TEPCO joins the Group", ar: "انضمام TEPCO إلى المجموعة" }, description: { en: "TEPCO is added to the Group.", ar: "انضمام TEPCO إلى المجموعة." } },
            { id: "year-2022", year: 2022, label: { en: "QYASAT joins the Group", ar: "انضمام QYASAT إلى المجموعة" }, description: { en: "QYASAT is added to the Group.", ar: "انضمام QYASAT إلى المجموعة." } },
            { id: "year-2023", year: 2023, label: { en: "New Group companies", ar: "شركات جديدة في المجموعة" }, description: { en: "Global Construction and OMS Saleri Saudia are added to the Group.", ar: "انضمام Global Construction وOMS Saleri Saudia إلى المجموعة." } },
            { id: "year-2024", year: 2024, label: { en: "New Group companies", ar: "شركات جديدة في المجموعة" }, description: { en: "Flame Spray Saudi and Al Yamuna Densons Arabia are added to the Group.", ar: "انضمام Flame Spray Saudi وAl Yamuna Densons Arabia إلى المجموعة." } },
            { id: "year-2025", year: 2025, label: { en: "Partnerships and expansion", ar: "الشراكات والتوسع" }, description: { en: "WAROM Technology Arabia and Ratnamani Metals & Tubes are added to the Group.", ar: "انضمام WAROM Technology Arabia وRatnamani Metals & Tubes إلى المجموعة." } },
        ],
    },
    our_companies: {
        section_title: "18 specialized companies and joint ventures",
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
                description: { en: "Expanding production capabilities within the Kingdom.", ar: "توسيع قدرات الإنتاج داخل المملكة." },
                icon: "factory",
            },
            {
                id: 2,
                title: { en: "Technology Transfer", ar: "نقل التقنية" },
                description: { en: "Bringing advanced technologies and expertise to local industry.", ar: "نقل التقنيات المتقدمة والخبرات إلى الصناعة المحلية." },
                icon: "cpu",
            },
            {
                id: 3,
                title: { en: "Saudi Workforce Development", ar: "تطوير الكوادر السعودية" },
                description: { en: "Developing skilled Saudi talent for the energy sector.", ar: "تطوير الكفاءات السعودية الماهرة لقطاع الطاقة." },
                icon: "users",
            },
            {
                id: 4,
                title: { en: "Resilient Local Supply Chains", ar: "سلاسل إمداد محلية مرنة" },
                description: { en: "Strengthening dependable local sourcing and supply networks.", ar: "تعزيز مصادر التوريد المحلية وشبكات الإمداد الموثوقة." },
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
    footer: { description: { en: "", ar: "" } },
    careers: {
        section_name: "Careers at Tamimi Energy",
        section_title: "Build what powers the Kingdom.",
        description: "Engineers, technicians and manufacturing specialists building the future of energy.",
        image: "",
        focus_areas: [1, 2, 3, 4].map((id) => ({ id: `focus-${id}`, title: "", description: "" })),
        statistics: [{ value: "18", label: "Group companies" }, { value: "", label: "" }],
    },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
