"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PagesTable from "./PagesTable";
import { useCmsPages } from "@/hooks/useCmsPages";

export default function PagesClient() {
    const { data: pages = [], isLoading } = useCmsPages();
    const router = useRouter();

    const handleEditContent = (page) => {
        router.push(`/dashboard/pages/${page.id}/edit`);
    };

    return (
        <>
            <PageHeader
                title="Pages & Home"
                icon="fal fa-file-alt"
                titleCol="col-lg-8"
                actionCol="col-lg-4"
            />

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading pages...</div>
            ) : (
                <PagesTable data={pages} onEditContent={handleEditContent} />
            )}
        </>
    );
}
