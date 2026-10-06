"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PostsTable from "./PostsTable";
import PostModal from "./PostModal";
import PostsTrashModal from "./PostsTrashModal";
import PostDetailsOffcanvas from "./PostDetailsOffcanvas";
import { confirmAction } from "@/utils/confirm";
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
    const { data: posts = [], isLoading } = usePosts();
    const { data: trashItems = [] } = useTrashPosts();

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
    const [showTrashModal, setShowTrashModal] = useState(false);

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
        if (selectedPost) {
            await updateMutation.mutateAsync({ ...selectedPost, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedPost(null);
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
            title: "Move to Trash?",
            message: "This post will be moved to the recycle bin.",
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
                title="Posts"
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
                    <span className="txt ms-2">Add post</span>
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
                    <span className="txt ms-2">View Trash ({trashItems.length})</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading posts...</div>
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
