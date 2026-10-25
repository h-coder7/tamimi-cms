"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PostsTable from "./PostsTable";
import PostModal from "./PostModal";
import PostsTrashModal from "./PostsTrashModal";
import PostDetailsOffcanvas from "./PostDetailsOffcanvas";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";
import {
    usePosts,
    useTrashPosts,
    useAddPost,
    useUpdatePost,
    useDeletePost,
    useRestorePost,
    usePermanentDeletePost,
    useBulkDeletePosts,
} from "@/hooks/usePosts";

export default function PostsClient() {
    const { t } = useI18n();
    const { data: posts = [], isLoading } = usePosts();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashItems = [] } = useTrashPosts({ enabled: showTrashModal });

    const addMutation = useAddPost();
    const updateMutation = useUpdatePost();
    const deleteMutation = useDeletePost();
    const restoreMutation = useRestorePost();
    const permanentDeleteMutation = usePermanentDeletePost();
    const bulkDeleteMutation = useBulkDeletePosts();

    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewPost, setViewPost] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedPost(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        try {
            if (selectedPost) {
                await updateMutation.mutateAsync({ ...selectedPost, ...data });
            } else {
                await addMutation.mutateAsync(data);
            }
            setIsModalOpen(false);
            setSelectedPost(null);
        } catch {
            // Error toast is handled in the mutation; keep the modal open for correction
        }
    };

    const handleEdit = (id) => {
        const post = posts.find((item) => item.id === id);
        if (post) {
            setSelectedPost(post);
            setIsModalOpen(true);
        }
    };

    const handleView = (post) => {
        setViewPost(post);
        setShowOffcanvas(true);
    };

    const handleDelete = (id) => {
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("posts.item") }),
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
                title={t("posts.title")}
                icon="fal fa-newspaper"
                titleCol="col-lg-4"
                actionCol="col-lg-8"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedPost(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("posts.add")}</span>
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
                <div className="text-center py-5 text-muted">{t("posts.loading")}</div>
            ) : (
                <PostsTable
                    data={posts}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            <PostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                post={selectedPost}
            />

            <PostsTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashItems={trashItems}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />

            <PostDetailsOffcanvas
                show={showOffcanvas}
                post={viewPost}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewPost(null);
                }}
            />
        </>
    );
}
