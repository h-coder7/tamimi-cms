"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import DownloadsTable from "./DownloadsTable";
import DownloadModal from "./DownloadModal";
import DownloadsTrashModal from "./DownloadsTrashModal";
import { confirmAction } from "@/utils/confirm";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";
import {
    useDownloads,
    useTrashDownloads,
    useAddDownload,
    useUpdateDownload,
    useDeleteDownload,
    useRestoreDownload,
    usePermanentDeleteDownload,
    useBulkDeleteDownloads,
} from "@/hooks/useDownloads";
import { useI18n } from "@/hooks/useI18n";

export default function DownloadsClient() {
    const { t } = useI18n();
    const { data: downloads = [], isLoading } = useDownloads();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashItems = [] } = useTrashDownloads({ enabled: showTrashModal });
    const { data: companies = [] } = useCompanies();

    const addMutation = useAddDownload();
    const updateMutation = useUpdateDownload();
    const deleteMutation = useDeleteDownload();
    const restoreMutation = useRestoreDownload();
    const permanentDeleteMutation = usePermanentDeleteDownload();
    const bulkDeleteMutation = useBulkDeleteDownloads();

    const [selectedDownload, setSelectedDownload] = useState(null);
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
            setSelectedDownload(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        if (selectedDownload) {
            await updateMutation.mutateAsync({ ...selectedDownload, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedDownload(null);
    };

    const handleEdit = (id) => {
        const download = downloads.find((item) => item.id === id);
        if (download) {
            setSelectedDownload(download);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id) => {
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("downloads.item") }),
            confirmLabel: t("confirm.moveTrashYes"),
            onConfirm: async () => {
                await deleteMutation.mutateAsync(id);
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
            },
        });
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
                title={t("downloads.title")}
                icon="fal fa-download"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedDownload(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("downloads.add")}</span>
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
                    <span className="txt ms-2">
                        {trashItems.length
                            ? t("common.viewTrashCount", { count: trashItems.length })
                            : t("common.viewTrash")}
                    </span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("downloads.loading")}</div>
            ) : (
                <DownloadsTable
                    data={downloads}
                    companiesByCode={companiesByCode}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <DownloadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                download={selectedDownload}
            />

            <DownloadsTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashItems={trashItems}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />
        </>
    );
}
