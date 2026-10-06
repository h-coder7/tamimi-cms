"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CompaniesTable from "./CompaniesTable";
import CompanyModal from "./CompanyModal";
import TrashModal from "./TrashModal";
import { confirmAction } from "@/utils/confirm";
import { toast } from "react-hot-toast";
import CompanyDetailsOffcanvas from "./CompanyDetailsOffcanvas";
import {
    useCompanies,
    useTrashCompanies,
    useAddCompany,
    useUpdateCompany,
    useDeleteCompany,
    useRestoreCompany,
    usePermanentDeleteCompany,
    useBulkDeleteCompanies
} from "@/hooks/useCompanies";

export default function CompaniesClient() {
    const { data: companies = [], isLoading } = useCompanies();
    const { data: trashCompanies = [] } = useTrashCompanies();

    const addCompanyMutation = useAddCompany();
    const updateCompanyMutation = useUpdateCompany();
    const deleteCompanyMutation = useDeleteCompany();
    const restoreCompanyMutation = useRestoreCompany();
    const permanentDeleteMutation = usePermanentDeleteCompany();
    const bulkDeleteMutation = useBulkDeleteCompanies();

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // Offcanvas State for View Details
    const [viewCompany, setViewCompany] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const [showTrashModal, setShowTrashModal] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedCompany(null);
            setIsModalOpen(true);
            // Clean URL
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    /* ======================================================================
       1. Handlers
       ====================================================================== */
    const handleSave = async (companyData) => {
        if (selectedCompany) {
            await updateCompanyMutation.mutateAsync({ ...selectedCompany, ...companyData });
        } else {
            await addCompanyMutation.mutateAsync(companyData);
        }
        setIsModalOpen(false);
        setSelectedCompany(null);
    };

    const handleEdit = (id) => {
        const company = companies.find(c => c.id === id);
        if (company) {
            setSelectedCompany(company);
            setIsModalOpen(true);
        }
    };

    /**
     * Open details offcanvas
     */
    const handleView = (company) => {
        setViewCompany(company);
        setShowOffcanvas(true);
    };

    const handleDelete = (id) => {
        confirmAction({
            title: "Move to Trash?",
            message: "This company will be moved to the recycle bin.",
            confirmLabel: "Yes, Move it",
            onConfirm: async () => {
                await deleteCompanyMutation.mutateAsync(id);
                setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            }
        });
    };

    const handleRestore = async (id) => {
        await restoreCompanyMutation.mutateAsync(id);
    };

    const handlePermanentDelete = async (id) => {
        await permanentDeleteMutation.mutateAsync(id);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        confirmAction({
            title: "Delete Selected Items?",
            message: `Are you sure you want to move ${selectedIds.length} items to trash?`,
            confirmLabel: "Yes, Delete",
            onConfirm: async () => {
                await bulkDeleteMutation.mutateAsync(selectedIds);
                setSelectedIds([]);
            }
        });
    };

    /* ======================================================================
       2. JSX
       ====================================================================== */
    return (
        <>
            <PageHeader
                title="Companies"
                icon="fal fa-building"
                titleCol="col-lg-4"
                actionCol="col-lg-8"
                onFilterChange={(field, checked) =>
                    console.log("Filter:", field, checked)
                }
            >
                {/* Add Button */}
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedCompany(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">Add Company</span>
                </button>

                {/* Delete Button */}
                <button
                    type="button"
                    className="alert alert-danger rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={handleBulkDelete}
                >
                    <i className="fal fa-trash"></i>
                    <span className="txt ms-2">Delete ({selectedIds.length})</span>
                </button>

                {/* View Trash Button */}
                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => setShowTrashModal(true)}
                >
                    <i className="fal fa-trash-undo"></i>
                    <span className="txt ms-2">View Trash ({trashCompanies.length})</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading companies...</div>
            ) : (
                <CompaniesTable
                    data={companies}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            {/* Modals */}
            <CompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                company={selectedCompany}
            />

            <TrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashCompanies={trashCompanies}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
            />

            {/* Details Offcanvas */}
            <CompanyDetailsOffcanvas
                show={showOffcanvas}
                company={viewCompany}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewCompany(null);
                }}
            />
        </>
    );
}
