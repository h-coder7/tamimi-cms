"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// ----------------------------------------------------------------------
// 📦 MOCK DATA & API SIMULATION
// ----------------------------------------------------------------------

const INDUSTRIES_SEED_VERSION = "tamimi-industries-v2";

export const VALUE_CHAIN_STAGES = [
    "Engineering & Design",
    "Manufacturing & Fabrication",
    "Supply & Distribution",
    "Installation & Commissioning",
    "Operations & Maintenance",
];

const TOTAL_STAGES = VALUE_CHAIN_STAGES.length;

export const emptyValueChainMapping = () =>
    Object.fromEntries(VALUE_CHAIN_STAGES.map((stage) => [stage, []]));

const withIndustryMeta = (industry) => {
    const companies = Array.isArray(industry.companies) ? industry.companies : [];
    const mapping = industry.value_chain_mapping || emptyValueChainMapping();
    const stagesWithCompanies = VALUE_CHAIN_STAGES.filter(
        (stage) => Array.isArray(mapping[stage]) && mapping[stage].length > 0
    );
    const stagesCount = stagesWithCompanies.length;
    const companiesCount = companies.length;

    return {
        ...industry,
        short_description: industry.short_description || industry.description || "",
        full_description: industry.full_description || "",
        description: industry.short_description || industry.description || "",
        companies,
        value_chain_mapping: mapping,
        value_chain: stagesWithCompanies,
        companies_count: companiesCount,
        companies_label: `${companiesCount} ${companiesCount === 1 ? "company" : "companies"}`,
        stages_count: stagesCount,
        stages_label: `${stagesCount} of ${TOTAL_STAGES} stages`,
        status: industry.status || "Draft",
        order: Number(industry.order) || 0,
        created_at: industry.created_at || "2026-03-01",
    };
};

const OIL_GAS_COMPANIES = [
    "SESCO", "ENERCO", "TCO", "S3C", "GET Water", "SSS", "GPDS", "TFF",
    "IPTC", "CT", "RGS", "TEPCO", "QYASAT", "WTA", "FSS", "G3C", "OSS", "YDA",
];

const OIL_GAS_MAPPING = {
    "Engineering & Design": ["ENERCO", "GET Water"],
    "Manufacturing & Fabrication": ["S3C", "TFF", "CT", "QYASAT", "WTA"],
    "Supply & Distribution": ["SESCO", "TCO", "CT", "WTA"],
    "Installation & Commissioning": ["ENERCO", "TCO", "GET Water", "RGS", "G3C"],
    "Operations & Maintenance": ["ENERCO", "TCO", "GET Water", "SSS", "FSS"],
};

const MOCK_INDUSTRIES = [
    withIndustryMeta({
        id: 1,
        title: "Oil & Gas",
        order: 1,
        status: "Draft",
        short_description:
            "Upstream, midstream and refinery scopes where equipment, materials and site execution all have to meet operator standards.",
        full_description: "[Pending: client marketing]",
        companies: OIL_GAS_COMPANIES,
        value_chain_mapping: OIL_GAS_MAPPING,
    }),
    withIndustryMeta({
        id: 2,
        title: "Power Generation",
        order: 2,
        status: "Draft",
        short_description: "Thermal, gas and industrial power generation.",
        full_description: "[Pending: client marketing]",
        companies: ["SESCO", "ENERCO", "TCO", "GPDS", "TFF", "TEPCO", "YDA", "GET Water", "SSS", "IPTC", "RGS"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["ENERCO", "GET Water"],
            "Manufacturing & Fabrication": ["TFF", "TEPCO", "GPDS"],
            "Supply & Distribution": ["SESCO", "TEPCO", "YDA"],
            "Installation & Commissioning": ["ENERCO", "TCO", "RGS"],
            "Operations & Maintenance": ["ENERCO", "TCO", "SSS"],
        },
    }),
    withIndustryMeta({
        id: 3,
        title: "Utilities",
        order: 3,
        status: "Draft",
        short_description: "Utility networks and grid infrastructure.",
        full_description: "[Pending: client marketing]",
        companies: ["SESCO", "GPDS", "TEPCO", "YDA", "ENERCO", "TCO", "RGS"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["ENERCO"],
            "Manufacturing & Fabrication": ["GPDS", "TEPCO"],
            "Supply & Distribution": ["SESCO", "YDA"],
            "Installation & Commissioning": ["TCO", "RGS"],
            "Operations & Maintenance": ["ENERCO", "TCO"],
        },
    }),
    withIndustryMeta({
        id: 4,
        title: "Water & Desalination",
        order: 4,
        status: "Draft",
        short_description: "Water treatment and desalination solutions.",
        full_description: "[Pending: client marketing]",
        companies: ["GET Water", "OSS", "SESCO"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["GET Water"],
            "Manufacturing & Fabrication": ["OSS"],
            "Supply & Distribution": ["SESCO"],
            "Installation & Commissioning": ["GET Water"],
            "Operations & Maintenance": [],
        },
    }),
    withIndustryMeta({
        id: 5,
        title: "Petrochemicals",
        order: 5,
        status: "Draft",
        short_description: "Petrochemical processing and specialty chemicals.",
        full_description: "[Pending: client marketing]",
        companies: ["CT", "S3C", "FSS", "WTA", "QYASAT", "TCO", "SESCO", "ENERCO", "OSS", "SSS"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["ENERCO"],
            "Manufacturing & Fabrication": ["CT", "S3C", "QYASAT", "WTA"],
            "Supply & Distribution": ["SESCO", "CT", "WTA"],
            "Installation & Commissioning": ["TCO"],
            "Operations & Maintenance": ["FSS", "SSS"],
        },
    }),
    withIndustryMeta({
        id: 6,
        title: "Industrial Manufacturing",
        order: 6,
        status: "Draft",
        short_description: "Heavy industrial and manufacturing operations.",
        full_description: "[Pending: client marketing]",
        companies: ["S3C", "TFF", "CT", "QYASAT"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": [],
            "Manufacturing & Fabrication": ["S3C", "TFF", "CT", "QYASAT"],
            "Supply & Distribution": ["CT"],
            "Installation & Commissioning": [],
            "Operations & Maintenance": [],
        },
    }),
    withIndustryMeta({
        id: 7,
        title: "Renewable Energy",
        order: 7,
        status: "Draft",
        short_description: "Solar, wind and sustainable energy systems.",
        full_description: "[Pending: client marketing]",
        companies: ["ENERCO", "TEPCO"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["ENERCO"],
            "Manufacturing & Fabrication": ["TEPCO"],
            "Supply & Distribution": ["TEPCO"],
            "Installation & Commissioning": ["ENERCO"],
            "Operations & Maintenance": [],
        },
    }),
    withIndustryMeta({
        id: 8,
        title: "Infrastructure",
        order: 8,
        status: "Draft",
        short_description: "Civil and industrial infrastructure projects.",
        full_description: "[Pending: client marketing]",
        companies: ["RGS", "G3C", "TCO", "SESCO", "ENERCO", "YDA"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["ENERCO"],
            "Manufacturing & Fabrication": ["YDA"],
            "Supply & Distribution": ["SESCO"],
            "Installation & Commissioning": ["RGS", "G3C", "TCO"],
            "Operations & Maintenance": [],
        },
    }),
    withIndustryMeta({
        id: 9,
        title: "Automation & Digital Solutions",
        order: 9,
        status: "Draft",
        short_description: "Automation, controls and digital industrial solutions.",
        full_description: "[Pending: client marketing]",
        companies: ["SSS", "QYASAT", "IPTC"],
        value_chain_mapping: {
            ...emptyValueChainMapping(),
            "Engineering & Design": ["IPTC"],
            "Manufacturing & Fabrication": ["QYASAT"],
            "Supply & Distribution": ["QYASAT"],
            "Installation & Commissioning": ["SSS"],
            "Operations & Maintenance": ["SSS"],
        },
    }),
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function sortByOrder(list) {
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getSeededIndustries() {
    const seedVersion = localStorage.getItem("industries_seed_version");

    if (seedVersion !== INDUSTRIES_SEED_VERSION) {
        localStorage.setItem("industries", JSON.stringify(MOCK_INDUSTRIES));
        localStorage.setItem("industries_seed_version", INDUSTRIES_SEED_VERSION);
        return MOCK_INDUSTRIES;
    }

    const stored = localStorage.getItem("industries");
    return stored ? JSON.parse(stored) : MOCK_INDUSTRIES;
}

function persistIndustries(list) {
    const normalized = sortByOrder(list.map(withIndustryMeta));
    localStorage.setItem("industries", JSON.stringify(normalized));
    return normalized;
}

// ----------------------------------------------------------------------
// 🚀 HOOKS
// ----------------------------------------------------------------------

export function useIndustries() {
    return useQuery({
        queryKey: ["industries"],
        queryFn: async () => {
            await delay(500);
            return sortByOrder(getSeededIndustries().map(withIndustryMeta));
        },
    });
}

export function useTrashIndustries() {
    return useQuery({
        queryKey: ["trash-industries"],
        queryFn: async () => {
            await delay(300);
            const stored = localStorage.getItem("trash-industries");
            return stored ? JSON.parse(stored).map(withIndustryMeta) : [];
        },
    });
}

export function useAddIndustry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newIndustry) => {
            await delay(500);
            const industries = getSeededIndustries();
            const nextOrder = Math.max(0, ...industries.map((i) => i.order || 0)) + 1;
            const industryWithId = withIndustryMeta({
                ...newIndustry,
                id: Math.max(0, ...industries.map((i) => i.id)) + 1,
                order: Number(newIndustry.order) || nextOrder,
                created_at: new Date().toISOString().split("T")[0],
            });
            persistIndustries([industryWithId, ...industries]);
            return industryWithId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["industries"] });
            toast.success("Industry added successfully!");
        },
    });
}

export function useUpdateIndustry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedIndustry) => {
            await delay(500);
            const industries = getSeededIndustries();
            const updated = industries.map((item) =>
                item.id === updatedIndustry.id ? withIndustryMeta(updatedIndustry) : item
            );
            persistIndustries(updated);
            return withIndustryMeta(updatedIndustry);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["industries"] });
            toast.success("Industry updated successfully!");
        },
    });
}

export function useDeleteIndustry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const industries = getSeededIndustries();
            const trash = JSON.parse(localStorage.getItem("trash-industries") || "[]");

            const industryToDelete = industries.find((item) => item.id === id);
            if (!industryToDelete) return id;

            persistIndustries(industries.filter((item) => item.id !== id));
            localStorage.setItem("trash-industries", JSON.stringify([industryToDelete, ...trash]));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["industries"] });
            queryClient.invalidateQueries({ queryKey: ["trash-industries"] });
            toast.success("Industry moved to trash!");
        },
    });
}

export function useRestoreIndustry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const industries = getSeededIndustries();
            const trash = JSON.parse(localStorage.getItem("trash-industries") || "[]");

            const industryToRestore = trash.find((item) => item.id === id);
            if (!industryToRestore) return id;

            persistIndustries([industryToRestore, ...industries]);
            localStorage.setItem(
                "trash-industries",
                JSON.stringify(trash.filter((item) => item.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["industries"] });
            queryClient.invalidateQueries({ queryKey: ["trash-industries"] });
            toast.success("Industry restored successfully!");
        },
    });
}

export function usePermanentDeleteIndustry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const trash = JSON.parse(localStorage.getItem("trash-industries") || "[]");
            localStorage.setItem(
                "trash-industries",
                JSON.stringify(trash.filter((item) => item.id !== id))
            );
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-industries"] });
            toast.success("Industry permanently deleted!");
        },
    });
}

export function useBulkDeleteIndustries() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(500);
            const industries = getSeededIndustries();
            const trash = JSON.parse(localStorage.getItem("trash-industries") || "[]");

            const itemsToDelete = industries.filter((item) => ids.includes(item.id));
            const remaining = industries.filter((item) => !ids.includes(item.id));

            persistIndustries(remaining);
            localStorage.setItem("trash-industries", JSON.stringify([...itemsToDelete, ...trash]));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["industries"] });
            queryClient.invalidateQueries({ queryKey: ["trash-industries"] });
            toast.success("Selected industries moved to trash!");
        },
    });
}
