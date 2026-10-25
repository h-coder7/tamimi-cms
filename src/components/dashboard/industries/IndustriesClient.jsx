"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import IndustriesTable from "./IndustriesTable";
import IndustryModal from "./IndustryModal";
import IndustriesTrashModal from "./IndustriesTrashModal";
import IndustryDetailsOffcanvas from "./IndustryDetailsOffcanvas";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";
import {
    useIndustries,
    useTrashIndustries,
    useAddIndustry,
    useUpdateIndustry,
    useDeleteIndustry,
    useRestoreIndustry,
    usePermanentDeleteIndustry,
    useBulkDeleteIndustries,
} from "@/hooks/useIndustries";

export default function IndustriesClient() {
    const { t } = useI18n();
    const { data: industries = [], isLoading } = useIndustries();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashIndustries = [] } = useTrashIndustries({ enabled: showTrashModal });

    const addIndustryMutation = useAddIndustry();
    const updateIndustryMutation = useUpdateIndustry();
    const deleteIndustryMutation = useDeleteIndustry();
    const restoreIndustryMutation = useRestoreIndustry();
    const permanentDeleteMutation = usePermanentDeleteIndustry();
    const bulkDeleteMutation = useBulkDeleteIndustries();

    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewIndustry, setViewIndustry] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedIndustry(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (industryData) => {
        if (selectedIndustry) {
            await updateIndustryMutation.mutateAsync({ ...selectedIndustry, ...industryData });
        } else {
            await addIndustryMutation.mutateAsync(industryData);
        }
        setIsModalOpen(false);
        setSelectedIndustry(null);
    };

    const handleEdit = (id) => {
        const industry = industries.find((item) => item.id === id);
        if (industry) {
            setSelectedIndustry(industry);
            setIsModalOpen(true);
        }
    };

    const handleView = (industry) => {
        setViewIndustry(industry);
        setShowOffcanvas(true);
    };

    const handleDelete = (id) => {
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("industries.item") }),
            confirmLabel: t("confirm.moveTrashYes"),
            onConfirm: async () => {
                await deleteIndustryMutation.mutateAsync(id);
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
            },
        });
    };

    const handleRestore = async (id) => {
        await restoreIndustryMutation.mutateAsync(id);
    };

    const handlePermanentDelete = async (id) => {
        await permanentDeleteMutation.mutateAsync(id);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        confirmAction({
            title: t("confirm.deleteSelectedTitle"),
            message: t("confirm.deleteSelectedMessage", { count: selectedIds.length }),
            confirmLabel: t("confirm.deleteYes"),
            onConfirm: async () => {
                await bulkDeleteMutation.mutateAsync(selectedIds);
                setSelectedIds([]);
            },
        });
    };

    return (
        <>
            <PageHeader
                title={t("industries.title")}
                icon="fal fa-industry"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedIndustry(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("industries.add")}</span>
                </button>

                <button
                    type="button"
                    className="alert alert-danger rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={handleBulkDelete}
                >
                    <i className="fal fa-trash"></i>
                    <span className="txt ms-2">{t("common.deleteCount", { count: selectedIds.length })}</span>
                </button>

                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => setShowTrashModal(true)}
                >
                    <i className="fal fa-trash-undo"></i>
                    <span className="txt ms-2">{trashIndustries.length ? t("common.viewTrashCount", { count: trashIndustries.length }) : t("common.viewTrash")}</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("industries.loading")}</div>
            ) : (
                <IndustriesTable
                    data={industries}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            <IndustryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                industry={selectedIndustry}
            />

            <IndustriesTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashIndustries={trashIndustries}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
            />

            <IndustryDetailsOffcanvas
                show={showOffcanvas}
                industry={viewIndustry}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewIndustry(null);
                }}
            />
        </>
    );
}
