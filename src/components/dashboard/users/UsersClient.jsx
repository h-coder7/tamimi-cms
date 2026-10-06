"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import UsersTable from "./UsersTable";
import UserModal from "./UserModal";
import { confirmAction } from "@/utils/confirm";
import {
    useUsers,
    useAddUser,
    useUpdateUser,
    useDeleteUser,
} from "@/hooks/useUsers";

export default function UsersClient() {
    const { data: users = [], isLoading } = useUsers();
    const addMutation = useAddUser();
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();

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
        confirmAction({
            title: "Remove user?",
            message: "This user will lose access to the CMS.",
            confirmLabel: "Yes, Remove",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(id);
            },
        });
    };

    return (
        <>
            <PageHeader
                title="Users & Roles"
                icon="fal fa-users"
                titleCol="col-lg-6"
                actionCol="col-lg-6"
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
                    <span className="txt ms-2">Add user</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading users...</div>
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
        </>
    );
}
