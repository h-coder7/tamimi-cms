import homePage from "../home/data";
import groupHistoryPage from "../group-history/data";
import industriesPage from "../industries/data";
import companyDirectoryPage from "../company-directory/data";
import projectExperiencePage from "../project-experience/data";
import clientsPartnersPage from "../clients-partners/data";
import sustainabilityPage from "../sustainability/data";
import mediaCenterPage from "../media-center/data";
import careersPage from "../careers/data";
import downloadsPage from "../downloads/data";
import contactPage from "../contact/data";

/** List seed for Pages table + localStorage */
export const CMS_PAGE_DEFINITIONS = [
    homePage,
    groupHistoryPage,
    industriesPage,
    companyDirectoryPage,
    projectExperiencePage,
    clientsPartnersPage,
    sustainabilityPage,
    mediaCenterPage,
    careersPage,
    downloadsPage,
    contactPage,
];

const byId = Object.fromEntries(CMS_PAGE_DEFINITIONS.map((page) => [page.id, page]));

export function getPageDefinition(pageOrId) {
    if (!pageOrId) return null;
    if (typeof pageOrId === "number") return byId[pageOrId] || null;
    if (typeof pageOrId === "string") return byId[Number(pageOrId)] || null;
    return byId[pageOrId.id] || null;
}

export function getDefaultPageContent(page) {
    const definition = getPageDefinition(page);
    return definition?.content ? { ...definition.content } : {};
}

export function getMockPagesList() {
    return CMS_PAGE_DEFINITIONS.map((definition) => ({
        id: definition.id,
        page: definition.page,
        url: definition.url,
        editable_fields: definition.editable_fields,
        sections: definition.sections,
        status: definition.status,
        last_updated: definition.last_updated || "",
        content: { ...(definition.content || {}) },
    }));
}
