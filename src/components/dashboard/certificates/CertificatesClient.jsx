"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CertificatesTable from "./CertificatesTable";
import CertificateModal from "./CertificateModal";
import CertificatesTrashModal from "./CertificatesTrashModal";
import { confirmAction } from "@/utils/confirm";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";
import {
    useCertificates,
    useTrashCertificates,
    useAddCertificate,
    useUpdateCertificate,
    useDeleteCertificate,
    useRestoreCertificate,
    usePermanentDeleteCertificate,
    useBulkDeleteCertificates,
} from "@/hooks/useCertificates";

export default function CertificatesClient() {
    const { data: certificates = [], isLoading } = useCertificates();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashItems = [] } = useTrashCertificates({ enabled: showTrashModal });
    const { data: companies = [] } = useCompanies();

    const addMutation = useAddCertificate();
    const updateMutation = useUpdateCertificate();
    const deleteMutation = useDeleteCertificate();
    const restoreMutation = useRestoreCertificate();
    const permanentDeleteMutation = usePermanentDeleteCertificate();
    const bulkDeleteMutation = useBulkDeleteCertificates();

    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const companiesByCode = useMemo(
        () => buildCompaniesByCode(companies, { includeGroup: true }),
        [companies]
    );

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedCertificate(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        if (selectedCertificate) {
            await updateMutation.mutateAsync({ ...selectedCertificate, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedCertificate(null);
    };

    const handleEdit = (id) => {
        const certificate = certificates.find((item) => item.id === id);
        if (certificate) {
            setSelectedCertificate(certificate);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id) => {
        confirmAction({
            title: "Move to Trash?",
            message: "This certificate will be moved to the recycle bin.",
            confirmLabel: "Yes, Move it",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(id);
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
            },
        });
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
            },
        });
    };

    return (
        <>
            <PageHeader
                title="Certificates & accreditations"
                icon="fal fa-certificate"
                titleCol="col-lg-6"
                actionCol="col-lg-6"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedCertificate(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">Add certificate</span>
                </button>

                <button
                    type="button"
                    className="alert alert-danger rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={handleBulkDelete}
                >
                    <i className="fal fa-trash"></i>
                    <span className="txt ms-2">Delete ({selectedIds.length})</span>
                </button>

                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => setShowTrashModal(true)}
                >
                    <i className="fal fa-trash-undo"></i>
                    <span className="txt ms-2">View Trash{trashItems.length ? ` (${trashItems.length})` : ""}</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading certificates...</div>
            ) : (
                <CertificatesTable
                    data={certificates}
                    companiesByCode={companiesByCode}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <CertificateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                certificate={selectedCertificate}
            />

            <CertificatesTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashItems={trashItems}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />
        </>
    );
}
