"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProjectsTable from "./ProjectsTable";
import ProjectModal from "./ProjectModal";
import ProjectsTrashModal from "./ProjectsTrashModal";
import ProjectDetailsOffcanvas from "./ProjectDetailsOffcanvas";
import { confirmAction } from "@/utils/confirm";
import { useCompanies } from "@/hooks/useCompanies";
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
    const { data: projects = [], isLoading } = useProjects();
    const { data: trashProjects = [] } = useTrashProjects();
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
    const [showTrashModal, setShowTrashModal] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const companiesByCode = useMemo(() => {
        const map = {};
        companies.forEach((company) => {
            if (company.code) map[company.code] = company;
        });
        return map;
    }, [companies]);

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
            title: "Move to Trash?",
            message: "This project will be moved to the recycle bin.",
            confirmLabel: "Yes, Move it",
            onConfirm: async () => {
                await deleteProjectMutation.mutateAsync(id);
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
                title="Projects"
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
                    <span className="txt ms-2">Add project</span>
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
                    <span className="txt ms-2">View Trash ({trashProjects.length})</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading projects...</div>
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
