"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProjectsTable from "./ProjectsTable";
import ProjectModal from "./ProjectModal";
import ProjectsTrashModal from "./ProjectsTrashModal";
import ProjectDetailsOffcanvas from "./ProjectDetailsOffcanvas";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";
import {
    useProjects,
    useTrashProjects,
    useAddProject,
    useUpdateProject,
    useDeleteProject,
    useRestoreProject,
    usePermanentDeleteProject,
    useBulkDeleteProjects,
} from "@/hooks/useProjects";

export default function ProjectsClient() {
    const { t } = useI18n();
    const { data: projects = [], isLoading } = useProjects();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashProjects = [] } = useTrashProjects({ enabled: showTrashModal });
    const { data: companies = [] } = useCompanies();

    const addProjectMutation = useAddProject();
    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();
    const restoreProjectMutation = useRestoreProject();
    const permanentDeleteMutation = usePermanentDeleteProject();
    const bulkDeleteMutation = useBulkDeleteProjects();

    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewProject, setViewProject] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const companiesByCode = useMemo(
        () => buildCompaniesByCode(companies),
        [companies]
    );

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedProject(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (projectData) => {
        if (selectedProject) {
            await updateProjectMutation.mutateAsync({ ...selectedProject, ...projectData });
        } else {
            await addProjectMutation.mutateAsync(projectData);
        }
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const handleEdit = (id) => {
        const project = projects.find((item) => item.id === id);
        if (project) {
            setSelectedProject(project);
            setIsModalOpen(true);
        }
    };

    const handleView = (project) => {
        setViewProject(project);
        setShowOffcanvas(true);
    };

    const handleDelete = (id) => {
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("projects.item") }),
            confirmLabel: t("confirm.moveTrashYes"),
            onConfirm: async () => {
                await deleteProjectMutation.mutateAsync(id);
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
                title={t("projects.title")}
                icon="fal fa-briefcase"
                titleCol="col-lg-4"
                actionCol="col-lg-8"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedProject(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("projects.add")}</span>
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
                    <span className="txt ms-2">{trashProjects.length ? t("common.viewTrashCount", { count: trashProjects.length }) : t("common.viewTrash")}</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("projects.loading")}</div>
            ) : (
                <ProjectsTable
                    data={projects}
                    companiesByCode={companiesByCode}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                project={selectedProject}
            />

            <ProjectsTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashProjects={trashProjects}
                onRestore={(id) => restoreProjectMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />

            <ProjectDetailsOffcanvas
                show={showOffcanvas}
                project={viewProject}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewProject(null);
                }}
            />
        </>
    );
}
