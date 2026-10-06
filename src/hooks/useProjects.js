"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const PROJECTS_SEED_VERSION = "tamimi-projects-v2";

const withProjectMeta = (project) => ({
    ...project,
    featured: Boolean(project.featured),
    is_sample: Boolean(project.is_sample),
    status: project.status || "Draft",
    year: Number(project.year) || null,
    services: Array.isArray(project.services) ? project.services : [],
    value_chain: Array.isArray(project.value_chain) ? project.value_chain : [],
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    location: project.location || "",
    challenge: project.challenge || "",
    solution: project.solution || "",
    result: project.result || "",
    cover: project.cover || "",
    created_at: project.created_at || "2026-03-01",
});

const MOCK_PROJECTS = [
    withProjectMeta({
        id: 1,
        title: "Electrical & instrumentation supply for a gas plant expansion",
        client: "Confidential energy operator",
        location: "Eastern Province, Saudi Arabia",
        company_code: "SESCO",
        industry: "Oil & Gas",
        year: 2024,
        featured: true,
        status: "Published",
        is_sample: true,
        content_label: "Sample · full content",
        summary:
            "Supply of electrical and instrumentation materials for a gas plant expansion under tight operator standards.",
        challenge:
            "The operator needed reliable electrical and instrumentation materials delivered to a live expansion site with strict vendor and documentation requirements.",
        solution:
            "SESCO supplied approved materials packages with coordinated logistics, inspection support and documentation aligned to operator standards.",
        result:
            "Materials were delivered on schedule with full traceability, supporting uninterrupted expansion works.",
        services: [
            "Electrical materials supply",
            "Instrumentation packages",
            "Vendor documentation",
            "Site coordination support",
        ],
        value_chain: ["Supply & Distribution"],
        gallery: [],
        cover: "",
    }),
    withProjectMeta({
        id: 2,
        title: "[Sample] Gas turbine overhaul programme",
        client: "[Sample] Utility operator",
        location: "Riyadh, Saudi Arabia",
        company_code: "TCO",
        industry: "Power Generation",
        year: 2024,
        featured: true,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative gas turbine overhaul programme case study.",
        challenge: "[Sample] Planned overhaul windows with limited outage time.",
        solution: "[Sample] Coordinated turbine services and spare parts programme.",
        result: "[Sample] Units returned to service within the planned window.",
        services: ["Turbine overhaul", "Operations & maintenance support"],
        value_chain: ["Operations & Maintenance", "Installation & Commissioning"],
    }),
    withProjectMeta({
        id: 3,
        title: "[Sample] Mobile desalination for a remote site",
        client: "[Sample] Oil & gas operator",
        location: "Remote site, Saudi Arabia",
        company_code: "GET Water",
        industry: "Water & Desalination",
        year: 2023,
        featured: true,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative mobile desalination deployment for a remote site.",
        challenge: "[Sample] Temporary water demand at a remote operations site.",
        solution: "[Sample] Mobile desalination units with rapid mobilisation.",
        result: "[Sample] Reliable water supply for site operations.",
        services: ["Mobile desalination", "Commissioning"],
        value_chain: ["Engineering & Design", "Installation & Commissioning", "Operations & Maintenance"],
    }),
    withProjectMeta({
        id: 4,
        title: "[Sample] MV switchgear for an industrial substation",
        client: "[Sample] EPC contractor",
        location: "Jubail, Saudi Arabia",
        company_code: "GPDS",
        industry: "Utilities",
        year: 2024,
        featured: true,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative MV switchgear package for an industrial substation.",
        challenge: "[Sample] Substation package with short manufacturing lead time.",
        solution: "[Sample] Factory-built MV switchgear with testing and delivery.",
        result: "[Sample] Switchgear installed and energised on programme.",
        services: ["MV switchgear", "Factory testing"],
        value_chain: ["Manufacturing & Fabrication", "Supply & Distribution"],
    }),
    withProjectMeta({
        id: 5,
        title: "[Sample] Pipe coating package",
        client: "[Sample] Petrochemical plant",
        location: "Yanbu, Saudi Arabia",
        company_code: "S3C",
        industry: "Petrochemicals",
        year: 2022,
        featured: false,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative pipe coating package for a petrochemical plant.",
        challenge: "[Sample] Corrosion protection for process piping.",
        solution: "[Sample] Protective coating package matched to service conditions.",
        result: "[Sample] Coated pipework accepted for installation.",
        services: ["Pipe coating"],
        value_chain: ["Manufacturing & Fabrication"],
    }),
    withProjectMeta({
        id: 6,
        title: "[Sample] Shutdown scaffolding",
        client: "[Sample] Refinery",
        location: "Ras Tanura, Saudi Arabia",
        company_code: "RGS",
        industry: "Oil & Gas",
        year: 2023,
        featured: false,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative shutdown scaffolding scope for a refinery.",
        challenge: "[Sample] Complex access during a short shutdown window.",
        solution: "[Sample] Scaffolding package designed around critical path works.",
        result: "[Sample] Access ready ahead of craft mobilisation.",
        services: ["Scaffolding", "Access design"],
        value_chain: ["Installation & Commissioning"],
    }),
    withProjectMeta({
        id: 7,
        title: "[Sample] Hybrid solar rental power",
        client: "[Sample] Construction camp",
        location: "NEOM region, Saudi Arabia",
        company_code: "ENERCO",
        industry: "Renewable Energy",
        year: 2025,
        featured: false,
        status: "Draft",
        is_sample: true,
        content_label: "Sample",
        summary: "Illustrative hybrid solar rental power for a construction camp.",
        challenge: "[Sample] Temporary camp power with lower fuel burn.",
        solution: "[Sample] Hybrid solar + generator rental package.",
        result: "[Sample] Reduced diesel consumption during camp operations.",
        services: ["Hybrid rental power", "Site commissioning"],
        value_chain: ["Engineering & Design", "Installation & Commissioning", "Operations & Maintenance"],
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function getSeededProjects() {
    const seedVersion = localStorage.getItem("projects_seed_version");

    if (seedVersion !== PROJECTS_SEED_VERSION) {
        localStorage.setItem("projects", JSON.stringify(MOCK_PROJECTS));
        localStorage.setItem("projects_seed_version", PROJECTS_SEED_VERSION);
        return MOCK_PROJECTS;
    }

    const stored = localStorage.getItem("projects");
    return stored ? JSON.parse(stored) : MOCK_PROJECTS;
}

function persistProjects(list) {
    const normalized = list.map(withProjectMeta);
    localStorage.setItem("projects", JSON.stringify(normalized));
    return normalized;
}

export function useProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            await delay(500);
            return getSeededProjects().map(withProjectMeta);
        },
    });
}

export function useTrashProjects() {
    return useQuery({
        queryKey: ["trash-projects"],
        queryFn: async () => {
            await delay(300);
            const stored = localStorage.getItem("trash-projects");
            return stored ? JSON.parse(stored).map(withProjectMeta) : [];
        },
    });
}

export function useAddProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newProject) => {
            await delay(500);
            const projects = getSeededProjects();
            const projectWithId = withProjectMeta({
                ...newProject,
                id: Math.max(0, ...projects.map((p) => p.id)) + 1,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistProjects([projectWithId, ...projects]);
            return projectWithId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project added successfully!");
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedProject) => {
            await delay(500);
            const projects = getSeededProjects();
            persistProjects(
                projects.map((item) =>
                    item.id === updatedProject.id ? withProjectMeta(updatedProject) : item
                )
            );
            return withProjectMeta(updatedProject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project updated successfully!");
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const projects = getSeededProjects();
            const trash = JSON.parse(localStorage.getItem("trash-projects") || "[]");
            const projectToDelete = projects.find((item) => item.id === id);
            if (!projectToDelete) return id;

            persistProjects(projects.filter((item) => item.id !== id));
            localStorage.setItem("trash-projects", JSON.stringify([projectToDelete, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["trash-projects"] });
            toast.success("Project moved to trash!");
        },
    });
}

export function useRestoreProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const projects = getSeededProjects();
            const trash = JSON.parse(localStorage.getItem("trash-projects") || "[]");
            const projectToRestore = trash.find((item) => item.id === id);
            if (!projectToRestore) return id;

            persistProjects([projectToRestore, ...projects]);
            localStorage.setItem(
                "trash-projects",
                JSON.stringify(trash.filter((item) => item.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["trash-projects"] });
            toast.success("Project restored successfully!");
        },
    });
}

export function usePermanentDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const trash = JSON.parse(localStorage.getItem("trash-projects") || "[]");
            localStorage.setItem(
                "trash-projects",
                JSON.stringify(trash.filter((item) => item.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-projects"] });
            toast.success("Project permanently deleted!");
        },
    });
}

export function useBulkDeleteProjects() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(500);
            const projects = getSeededProjects();
            const trash = JSON.parse(localStorage.getItem("trash-projects") || "[]");
            const itemsToDelete = projects.filter((item) => ids.includes(item.id));
            const remaining = projects.filter((item) => !ids.includes(item.id));

            persistProjects(remaining);
            localStorage.setItem("trash-projects", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["trash-projects"] });
            toast.success("Selected projects moved to trash!");
        },
    });
}
