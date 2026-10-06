"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ClientsPartnersGrid from "./ClientsPartnersGrid";
import ClientPartnerModal from "./ClientPartnerModal";
import ClientsPartnersTrashModal from "./ClientsPartnersTrashModal";
import { confirmAction } from "@/utils/confirm";
import {
    useClientsPartners,
    useTrashClientsPartners,
    useAddClientPartner,
    useUpdateClientPartner,
    useDeleteClientPartner,
    useRestoreClientPartner,
    usePermanentDeleteClientPartner,
} from "@/hooks/useClientsPartners";

export default function ClientsPartnersClient() {
    const { data: partners = [], isLoading } = useClientsPartners();
    const { data: trashItems = [] } = useTrashClientsPartners();

    const addMutation = useAddClientPartner();
    const updateMutation = useUpdateClientPartner();
    const deleteMutation = useDeleteClientPartner();
    const restoreMutation = useRestoreClientPartner();
    const permanentDeleteMutation = usePermanentDeleteClientPartner();

    const [selectedPartner, setSelectedPartner] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTrashModal, setShowTrashModal] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            setSelectedPartner(null);
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams);
            params.delete("action");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const handleSave = async (data) => {
        if (selectedPartner) {
            await updateMutation.mutateAsync({ ...selectedPartner, ...data });
        } else {
            await addMutation.mutateAsync(data);
        }
        setIsModalOpen(false);
        setSelectedPartner(null);
    };

    const handleEdit = (id) => {
        const partner = partners.find((item) => item.id === id);
        if (partner) {
            setSelectedPartner(partner);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id) => {
        confirmAction({
            title: "Move to Trash?",
            message: "This logo will be moved to the recycle bin.",
            confirmLabel: "Yes, Move it",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(id);
            },
        });
    };

    return (
        <>
            <PageHeader
                title="Clients & Partners"
                icon="fal fa-handshake"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => {
                        setSelectedPartner(null);
                        setIsModalOpen(true);
                    }}
                >
                    <i className="fal fa-plus"></i>
                    <span className="txt ms-2">Add logo</span>
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
                <div className="text-center py-5 text-muted">Loading logos...</div>
            ) : (
                <ClientsPartnersGrid
                    data={partners}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <ClientPartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                partner={selectedPartner}
                nextOrder={Math.max(0, ...partners.map((item) => item.display_order || 0)) + 1}
            />

            <ClientsPartnersTrashModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                trashItems={trashItems}
                onRestore={(id) => restoreMutation.mutateAsync(id)}
                onPermanentDelete={(id) => permanentDeleteMutation.mutateAsync(id)}
            />
        </>
    );
}
