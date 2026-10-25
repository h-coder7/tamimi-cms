"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import UsersTable from "./UsersTable";
import UserModal from "./UserModal";
import AdminsTrashModal from "./AdminsTrashModal";
import { confirmAction } from "@/utils/confirm";
import {
    useUsers,
    useTrashUsers,
    useAddUser,
    useUpdateUser,
    useDeleteUser,
    useRestoreUser,
    usePermanentDeleteUser,
} from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

export default function UsersClient() {
    const { t } = useI18n();
    const { user: currentAdmin } = useAuth();
    const { data: users = [], isLoading } = useUsers();
    const [showTrashModal, setShowTrashModal] = useState(false);
    const { data: trashAdmins = [] } = useTrashUsers({ enabled: showTrashModal });
    const addMutation = useAddUser();
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();
    const restoreMutation = useRestoreUser();
    const permanentDeleteMutation = usePermanentDeleteUser();

    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedUser(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        if (selectedUser) {
            await updateMutation.mutateAsync({ ...selectedUser, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (id === currentAdmin?.id) {
            toast.error(t("admins.cannotDeleteSelf"));
            return;
        }
        confirmAction({
            title: t("confirm.moveTrashTitle"),
            message: t("confirm.moveTrashMessage", { item: t("admins.item") }),
            confirmLabel: t("confirm.moveTrashYes"),
            onConfirm: async () => {
                await deleteMutation.mutateAsync(id);
            },
        });
    };

    return (
        <>
            <PageHeader
                title={t("admins.title")}
                icon="fal fa-users"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">{t("admins.add")}</span>
                </button>

                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => setShowTrashModal(true)}
                >
                    <i className="fal fa-trash-undo"></i>
                    <span className="txt ms-2">
                        {trashAdmins.length
                            ? t("common.viewTrashCount", { count: trashAdmins.length })
                            : t("common.viewTrash")}
                    </span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("admins.loading")}</div>
            ) : (
                <UsersTable
                    data={users}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onSave={handleSave}
                user={selectedUser}
            />

            <AdminsTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashAdmins={trashAdmins}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />
        </>
    );
}
