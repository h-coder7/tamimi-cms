"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PagesTable from "./PagesTable";
import { useCmsPages } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";

export default function PagesClient() {
    const { t } = useI18n();
    const { data: pages = [], isLoading } = useCmsPages();
    const router = useRouter();

    const handleEditContent = (page) => {
        router.push(`/dashboard/pages/${page.id}/edit`);
    };

    return (
        <>
            <PageHeader
                title={t("pages.title")}
                icon="fal fa-file-alt"
                titleCol="col-lg-8"
                actionCol="col-lg-4"
            />

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("pages.loading")}</div>
            ) : (
                <PagesTable data={pages} onEditContent={handleEditContent} />
            )}
        </>
    );
}
