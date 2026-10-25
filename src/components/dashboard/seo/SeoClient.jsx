"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SeoTable from "./SeoTable";
import SeoModal from "./SeoModal";
import {
    useSeoPages,
    useUpdateSeoPage,
    downloadSitemapXml,
} from "@/hooks/useSeo";
import { useI18n } from "@/hooks/useI18n";

export default function SeoClient() {
    const { t } = useI18n();
    const { data: pages = [], isLoading } = useSeoPages();
    const updateMutation = useUpdateSeoPage();

    const [selectedPage, setSelectedPage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (page) => {
        setSelectedPage(page);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        await updateMutation.mutateAsync(data);
        setIsModalOpen(false);
        setSelectedPage(null);
    };

    return (
        <>
            <PageHeader
                title={t("seo.title")}
                icon="fal fa-search"
                titleCol="col-lg-6"
                actionCol="col-lg-6"
            >
                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={async () => {
                        await downloadSitemapXml(pages);
                    }}
                    disabled={isLoading || pages.length === 0}
                >
                    <i className="fal fa-sitemap"></i>
                    <span className="txt ms-2">{t("seo.generate")}</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">{t("seo.loading")}</div>
            ) : (
                <SeoTable data={pages} onEdit={handleEdit} />
            )}

            <SeoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPage(null);
                }}
                onSave={handleSave}
                page={selectedPage}
            />
        </>
    );
}
