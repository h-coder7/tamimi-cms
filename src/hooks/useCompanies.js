"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// ----------------------------------------------------------------------
// 📦 MOCK DATA & API SIMULATION
// ----------------------------------------------------------------------

const COMPANIES_SEED_VERSION = "tamimi-companies-v1";

const companyImage = (index) => `/images/companies/${((index - 1) % 10) + 1}.svg`;

const withCompanyMeta = (company, index) => {
    const industriesCount = Array.isArray(company.industries) ? company.industries.length : 0;
    const website = company.website || "";
    const pendingWebsite = website.toLowerCase().includes("pending");

    return {
        image: companyImage(index),
        country: "Saudi Arabia",
        address: "",
        location: "",
        description: company.field,
        domain: pendingWebsite || !website ? "" : (website.startsWith("http") ? website : `https://${website}`),
        industries_count: industriesCount,
        industries_label: `${industriesCount} industries · draft`,
        status: company.status || "Draft",
        created_at: "2026-03-01",
        ...company,
        website,
    };
};

const MOCK_COMPANIES = [
    withCompanyMeta({
        id: 1,
        title: "Saudi Electric Supply Company",
        code: "SESCO",
        type: "Subsidiary",
        field: "Electrical, mechanical & industrial supply",
        industries: ["Power & Energy", "Oil & Gas", "Industrial Manufacturing", "Electrical", "Construction", "Water"],
        website: "sesco-me.com",
    }, 1),
    withCompanyMeta({
        id: 2,
        title: "Energy Equipment Rental Company",
        code: "ENERCO",
        type: "Subsidiary",
        field: "Rental power & energy solutions",
        industries: ["Power & Energy", "Oil & Gas", "Industrial Manufacturing", "Construction"],
        website: "enerco.com.sa",
    }, 2),
    withCompanyMeta({
        id: 3,
        title: "Ali A. Al-Tamimi Trading & Contracting",
        code: "TCO",
        type: "Subsidiary",
        field: "Turbine services & equipment maintenance",
        industries: ["Power & Energy", "Oil & Gas", "Industrial Manufacturing"],
        website: "tco.com.sa",
    }, 3),
    withCompanyMeta({
        id: 4,
        title: "Saudi Conduit Coating Company",
        code: "S3C",
        type: "Subsidiary",
        field: "Protective & anti-corrosion coatings",
        industries: ["Oil & Gas", "Industrial Manufacturing", "Construction", "Chemicals"],
        website: "s3c.com.sa",
    }, 4),
    withCompanyMeta({
        id: 5,
        title: "GET Water Co. Ltd.",
        code: "GET Water",
        type: "Subsidiary",
        field: "Water treatment & mobile desalination",
        industries: ["Water", "Power & Energy", "Industrial Manufacturing"],
        website: "getwaterco.com",
    }, 5),
    withCompanyMeta({
        id: 6,
        title: "Saudi Sensing Solutions",
        code: "SSS",
        type: "Subsidiary",
        field: "Calibration & automation laboratories",
        industries: ["Calibration & Automation", "Oil & Gas", "Industrial Manufacturing", "Power & Energy"],
        website: "saudisensing.com",
    }, 6),
    withCompanyMeta({
        id: 7,
        title: "Gulf Power Distribution Systems Factory",
        code: "GPDS",
        type: "Subsidiary",
        field: "MV/LV panels & power distribution",
        industries: ["Power & Energy", "Electrical", "Industrial Manufacturing", "Construction", "Oil & Gas"],
        website: "gpds.com.sa",
    }, 7),
    withCompanyMeta({
        id: 8,
        title: "Tamimi Filter Factory",
        code: "TFF",
        type: "Subsidiary",
        field: "Gas turbine air filters",
        industries: ["Power & Energy", "Oil & Gas", "Industrial Manufacturing"],
        website: "[Pending: website]",
    }, 8),
    withCompanyMeta({
        id: 9,
        title: "Innovation Paths Training Center",
        code: "IPTC",
        type: "Subsidiary",
        field: "Training, consultancy & rehabilitation",
        industries: [],
        website: "iptc.com.sa",
    }, 9),
    withCompanyMeta({
        id: 10,
        title: "Clariant Al-Tamimi",
        code: "CT",
        type: "Joint Venture",
        field: "Specialty chemical solutions",
        industries: ["Chemicals", "Oil & Gas", "Industrial Manufacturing"],
        website: "clariant-tamimi.com",
    }, 10),
    withCompanyMeta({
        id: 11,
        title: "Resa-Gulf Scaffolding Co.",
        code: "RGS",
        type: "Joint Venture",
        field: "Scaffolding & formwork services",
        industries: ["Scaffolding", "Construction", "Oil & Gas", "Industrial Manufacturing"],
        website: "rgsksa.com",
    }, 11),
    withCompanyMeta({
        id: 12,
        title: "Technical Principles Co. for Metal Industries",
        code: "TEPCO",
        type: "Joint Venture",
        field: "Grounding rods, surge arresters & insulators",
        industries: ["Electrical", "Power & Energy", "Industrial Manufacturing"],
        website: "tepco.com.sa",
    }, 12),
    withCompanyMeta({
        id: 13,
        title: "Energy Measurement Devices Co.",
        code: "QYASAT",
        type: "Joint Venture",
        field: "Pressure & temperature instruments",
        industries: ["Calibration & Automation", "Oil & Gas", "Industrial Manufacturing"],
        website: "qyasat.com",
    }, 13),
    withCompanyMeta({
        id: 14,
        title: "WAROM Technology Arabia",
        code: "WTA",
        type: "Joint Venture",
        field: "Explosion-proof industrial products",
        industries: ["Oil & Gas", "Industrial Manufacturing", "Electrical"],
        website: "waromgroup.com",
    }, 14),
    withCompanyMeta({
        id: 15,
        title: "Flame Spray Saudi Industrial",
        code: "FSS",
        type: "Joint Venture",
        field: "Thermal spray & coating processes",
        industries: ["Industrial Manufacturing", "Oil & Gas", "Chemicals"],
        website: "flamespray.org",
    }, 15),
    withCompanyMeta({
        id: 16,
        title: "Global Construction Contracting Co.",
        code: "G3C",
        type: "Joint Venture",
        field: "Insulation, waterproofing & fireproofing",
        industries: ["Construction", "Oil & Gas", "Industrial Manufacturing"],
        website: "globalconstruction.com.sa",
    }, 16),
    withCompanyMeta({
        id: 17,
        title: "OMS Saleri Saudia Co.",
        code: "OSS",
        type: "Joint Venture",
        field: "Ball & plug valve manufacturing",
        industries: ["Oil & Gas", "Industrial Manufacturing", "Water"],
        website: "oms-saleri.sa",
    }, 17),
    withCompanyMeta({
        id: 18,
        title: "Al Yamuna Densons Arabia",
        code: "YDA",
        type: "Joint Venture",
        field: "Cable joints & terminations",
        industries: ["Electrical", "Power & Energy", "Industrial Manufacturing"],
        website: "alyamunadensons.ae",
    }, 18),
];

// Helper to simulate API calls
const delay = (ms) => new Promise(res => setTimeout(res, ms));

function getSeededCompanies() {
    const seedVersion = localStorage.getItem("companies_seed_version");

    if (seedVersion !== COMPANIES_SEED_VERSION) {
        localStorage.setItem("companies", JSON.stringify(MOCK_COMPANIES));
        localStorage.setItem("companies_seed_version", COMPANIES_SEED_VERSION);
        return MOCK_COMPANIES;
    }

    const stored = localStorage.getItem("companies");
    return stored ? JSON.parse(stored) : MOCK_COMPANIES;
}

// ----------------------------------------------------------------------
// 🚀 HOOKS
// ----------------------------------------------------------------------

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            // 🚀 When Laravel API is ready:
            // const res = await fetch("https://your-laravel-api.com/api/companies");
            // return res.json();

            await delay(500); // Simulate network
            return getSeededCompanies();
        },
    });
}

export function useTrashCompanies() {
    return useQuery({
        queryKey: ["trash-companies"],
        queryFn: async () => {
            await delay(300);
            const stored = localStorage.getItem("trash-companies");
            return stored ? JSON.parse(stored) : [];
        },
    });
}

export function useAddCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newCompany) => {
            // 🚀 When Laravel API is ready:
            // const res = await fetch("https://your-laravel-api.com/api/companies", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(newCompany)
            // });
            // return res.json();

            await delay(500);
            const companies = JSON.parse(localStorage.getItem("companies") || JSON.stringify(MOCK_COMPANIES));
            const companyWithId = { 
                ...newCompany, 
                id: Math.max(0, ...companies.map(c => c.id)) + 1,
                created_at: new Date().toISOString().split("T")[0] 
            };
            const updated = [companyWithId, ...companies];
            localStorage.setItem("companies", JSON.stringify(updated));
            return companyWithId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success("Company added successfully!");
        }
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedCompany) => {
            // 🚀 When Laravel API is ready:
            // const res = await fetch(`https://your-laravel-api.com/api/companies/${updatedCompany.id}`, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(updatedCompany)
            // });
            // return res.json();

            await delay(500);
            const companies = JSON.parse(localStorage.getItem("companies") || JSON.stringify(MOCK_COMPANIES));
            const updated = companies.map(c => c.id === updatedCompany.id ? updatedCompany : c);
            localStorage.setItem("companies", JSON.stringify(updated));
            return updatedCompany;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success("Company updated successfully!");
        }
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const companies = JSON.parse(localStorage.getItem("companies") || JSON.stringify(MOCK_COMPANIES));
            const trash = JSON.parse(localStorage.getItem("trash-companies") || "[]");
            
            const companyToDelete = companies.find(c => c.id === id);
            if (!companyToDelete) return id;

            const updatedCompanies = companies.filter(c => c.id !== id);
            const updatedTrash = [companyToDelete, ...trash];

            localStorage.setItem("companies", JSON.stringify(updatedCompanies));
            localStorage.setItem("trash-companies", JSON.stringify(updatedTrash));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            queryClient.invalidateQueries({ queryKey: ["trash-companies"] });
            toast.success("Company moved to trash!");
        }
    });
}

export function useRestoreCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const companies = JSON.parse(localStorage.getItem("companies") || JSON.stringify(MOCK_COMPANIES));
            const trash = JSON.parse(localStorage.getItem("trash-companies") || "[]");
            
            const companyToRestore = trash.find(c => c.id === id);
            if (!companyToRestore) return id;

            const updatedTrash = trash.filter(c => c.id !== id);
            const updatedCompanies = [companyToRestore, ...companies];

            localStorage.setItem("companies", JSON.stringify(updatedCompanies));
            localStorage.setItem("trash-companies", JSON.stringify(updatedTrash));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            queryClient.invalidateQueries({ queryKey: ["trash-companies"] });
            toast.success("Company restored successfully!");
        }
    });
}

export function usePermanentDeleteCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await delay(500);
            const trash = JSON.parse(localStorage.getItem("trash-companies") || "[]");
            const updatedTrash = trash.filter(c => c.id !== id);
            localStorage.setItem("trash-companies", JSON.stringify(updatedTrash));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trash-companies"] });
            toast.success("Company permanently deleted!");
        }
    });
}

export function useBulkDeleteCompanies() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            await delay(500);
            const companies = JSON.parse(localStorage.getItem("companies") || JSON.stringify(MOCK_COMPANIES));
            const trash = JSON.parse(localStorage.getItem("trash-companies") || "[]");

            const itemsToDelete = companies.filter(c => ids.includes(c.id));
            const remainingCompanies = companies.filter(c => !ids.includes(c.id));
            const updatedTrash = [...itemsToDelete, ...trash];

            localStorage.setItem("companies", JSON.stringify(remainingCompanies));
            localStorage.setItem("trash-companies", JSON.stringify(updatedTrash));
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            queryClient.invalidateQueries({ queryKey: ["trash-companies"] });
            toast.success("Selected companies moved to trash!");
        }
    });
}
