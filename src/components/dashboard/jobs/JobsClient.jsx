"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import JobsTable from "./JobsTable";
import JobModal from "./JobModal";
import JobsTrashModal from "./JobsTrashModal";
import { confirmAction } from "@/utils/confirm";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";
import { useI18n } from "@/hooks/useI18n";
import {
    useJobs,
    useTrashJobs,
    useAddJob,
    useUpdateJob,
    useDeleteJob,
    useRestoreJob,
    usePermanentDeleteJob,
    useBulkDeleteJobs,
} from "@/hooks/useJobs";

export default function JobsClient() {
    const { t } = useI18n();
    const { data: jobs = [], isLoading } = useJobs();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashItems = [] } = useTrashJobs({ enabled: showTrashModal });
    const { data: companies = [] } = useCompanies();

    const addMutation = useAddJob();
    const updateMutation = useUpdateJob();
    const deleteMutation = useDeleteJob();
    const restoreMutation = useRestoreJob();
    const permanentDeleteMutation = usePermanentDeleteJob();
    const bulkDeleteMutation = useBulkDeleteJobs();

    const [selectedJob, setSelectedJob] = useState(null);
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
            setSelectedJob(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        if (selectedJob) {
            await updateMutation.mutateAsync({ ...selectedJob, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedJob(null);
    };

    const handleEdit = (id) => {
        const job = jobs.find((item) => item.id === id);
        if (job) {
            setSelectedJob(job);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id) => {
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("jobs.item") }),
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
                title={t("jobs.title")}
                icon="fal fa-briefcase"
                titleCol="col-lg-4"
                actionCol="col-lg-8"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedJob(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("jobs.add")}</span>
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
                <div className="text-center py-5 text-muted">{t("jobs.loading")}</div>
            ) : (
                <JobsTable
                    data={jobs}
                    companiesByCode={companiesByCode}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                job={selectedJob}
            />

            <JobsTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashItems={trashItems}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />
        </>
    );
}
