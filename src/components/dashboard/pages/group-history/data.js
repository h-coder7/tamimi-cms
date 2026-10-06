export const pageMeta = {
    id: 2,
    page: "Group History",
    url: "/group-history",
    editable_fields: 51,
    sections: 6,
    status: "Draft",
    last_updated: "",
};

export const JOURNEY_MILESTONES = [
    {
        year: "1953",
        milestone:
            "The beginning: The late Sheikh Ali bin Abdullah Al Tamimi founds a company to execute pipelines and related general contracting work.",
    },
    {
        year: "1971 / 1976",
        milestone:
            "First specialised company: SESCO is established as the first specialised company. [Pending: confirm year — the earlier prototype says 1971, other material says 1976]",
    },
    {
        year: "1984",
        milestone: "Clariant Al-Tamimi added to the Group",
    },
    {
        year: "1985",
        milestone: "S3C added to the Group",
    },
    {
        year: "1993",
        milestone: "TCO added to the Group",
    },
    {
        year: "2003",
        milestone: "ENERCO added to the Group",
    },
    {
        year: "2006",
        milestone: "GPDS added to the Group",
    },
    {
        year: "2007",
        milestone:
            "Automation, sensing and water: Saudi Sensing, GET Water, Automation Solutions Saudi Arabia added to the Group",
    },
    {
        year: "2016",
        milestone:
            "The holding company: Tamimi Energy Holding Company is established and ownership of the subsidiaries is transferred to it, to manage their operations as one group.",
    },
    {
        year: "2018",
        milestone: "Resa-Gulf Scaffolding added to the Group",
    },
    {
        year: "2021",
        milestone: "TEPCO added to the Group",
    },
    {
        year: "2022",
        milestone: "QYASAT added to the Group",
    },
    {
        year: "2023",
        milestone: "Global Construction, OMS Saleri Saudia added to the Group",
    },
    {
        year: "2024",
        milestone: "Flame Spray Saudi, Al Yamuna Densons Arabia added to the Group",
    },
    {
        year: "2025",
        milestone:
            "Next: WAROM Technology Arabia, Ratnamani Metals & Tubes added to the Group",
    },
];

export const GROUP_VALUES = [
    { value: "Integrity", description: "" },
    { value: "Quality", description: "" },
    { value: "Customer Focus", description: "" },
    { value: "Innovation", description: "" },
    { value: "Growth", description: "" },
    { value: "Respect", description: "" },
];

export const defaultContent = {
    hero: {
        title: "More than 50 years energizing the Kingdom",
        intro_text:
            "Tamimi Energy Group is a subsidiary of Tamimi Holding. Its companies specialize in oil and gas, power, petrochemical, water, utility, industrial and renewable energy fields.",
    },
    our_journey: {
        section_title: "From a pipeline contractor to an integrated group",
        milestones: JOURNEY_MILESTONES.map((item) => ({ ...item })),
    },
    vision_mission: {
        vision:
            "To be the leading integrated energy solutions provider in the Middle East, driving innovation, sustainability, and operational excellence across the energy value chain.",
        mission:
            "To build and maintain innovative solutions in a safe and compliant manner within and outside Saudi Arabia, driven by talent and expertise to fulfill customer satisfaction; whilst maximizing our shareholders' value and commitment to the community.",
    },
    values: {
        items: GROUP_VALUES.map((item) => ({ ...item })),
    },
    group_structure: {
        section_title: "One group, 18 specialized companies",
    },
    vision_2030: {
        section_title: "Localization, manufacturing and sustainability",
        text: "Saudi manufacturing, innovation, strategic international partnerships and sustainable solutions that support Saudi Vision 2030.",
        local_content_figure: "[Pending: client figure]",
    },
};

export default {
    ...pageMeta,
    content: defaultContent,
};
