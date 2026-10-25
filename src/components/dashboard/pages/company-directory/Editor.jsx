"use client";

import { useI18n } from "@/hooks/useI18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.hero", fieldsCount: 2 },
    { id: "directory", number: "02", titleKey: "pages.section.directory", fieldsCount: 0 },
];

export default function CompanyDirectoryEditor() {
    const { t, isRtl } = useI18n();
    const dir = isRtl ? "rtl" : "ltr";
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const updateMutation = useUpdateCmsPage();

    const [activeSectionId, setActiveSectionId] = useState("hero");
    const [content, setContent] = useState(defaultContent);

    useEffect(() => {
        if (!page?.content) return;
        setContent({
            ...defaultContent,
            ...page.content,
            hero: { ...defaultContent.hero, ...(page.content.hero || {}) },
            directory: { ...defaultContent.directory, ...(page.content.directory || {}) },
        });
    }, [page]);

    const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection.id);
    const prevSection = activeIndex > 0 ? SECTIONS[activeIndex - 1] : null;
    const nextSection = SECTIONS[activeIndex + 1] || null;
    const section = content[activeSection.id] || {};

    const setField = (key, value) => {
        setContent((prev) => ({
            ...prev,
            [activeSection.id]: { ...(prev[activeSection.id] || {}), [key]: value },
        }));
    };

    const handleCancel = () => router.push("/dashboard/pages");
    const handlePreview = () => window.open(page?.url || pageMeta.url, "_blank", "noopener,noreferrer");

    const handleSavePublish = async () => {
        await updateMutation.mutateAsync({
            ...page,
            content,
            status: "Published",
        });
        router.push("/dashboard/pages");
    };

    if (isLoading) {
        return <div className="text-center py-5 text-muted">{t("pages.loadingEditor")}</div>;
    }

    if (!page) {
        return (
            <div className="text-center py-5">
                <p className="text-muted mb-3">{t("pages.notFound")}</p>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCancel}>
                    {t("pages.back")}
                </button>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title={t("pages.editTitle", { page: page.page })}
                icon="fal fa-file-edit"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button type="button" className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0" onClick={handlePreview}>
                    <span className="txt">{t("pages.preview")}</span>
                    <i className="fal fa-external-link ms-2"></i>
                </button>
                <button type="button" className="alert alert-light rounded-pill py-2 px-3 fsz-12 ms-2 border mb-0" onClick={handleCancel}>
                    <span className="txt">{t("common.cancel")}</span>
                </button>
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={handleSavePublish}
                    disabled={updateMutation.isPending}
                >
                    <i className="fal fa-check"></i>
                    <span className="txt ms-2">{t("pages.savePublish")}</span>
                </button>
            </PageHeader>

            <div className="page-editor mt-4">
                <aside className="page-editor__sidebar table-content p-0 mt-0 mb-0">
                    <div className="page-editor__sidebar-head">
                        <h6 className="mb-0 fsz-13 fw-600">{t("pages.sections")}</h6>
                    </div>
                    <div className="page-editor__sections">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`page-editor__section-item ${s.id === activeSection.id ? "active" : ""}`}
                                onClick={() => setActiveSectionId(s.id)}
                            >
                                <span className="page-editor__section-main">
                                    <span className="page-editor__section-num">{s.number}</span>
                                    <span className="page-editor__section-title">{t(s.titleKey)}</span>
                                </span>
                                <i className="fal fa-angle-right text-muted"></i>
                            </button>
                        ))}
                    </div>
                    <div className="page-editor__sidebar-foot">
                        {t("pages.sectionOrder")}
                    </div>
                </aside>

                <section className="page-editor__main table-content mt-0 mb-0">
                    <div className="page-editor__main-head">
                        <h6 className="mb-0 fsz-14 fw-600">
                            {activeSection.number} · {t(activeSection.titleKey)}
                        </h6>
                        <span className="fsz-12 text-muted">
                            {activeSection.fieldsCount
                                ? `${t("pages.editableFields", { count: activeSection.fieldsCount })}`
                                : t("pages.fromModule")}
                        </span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.title")} <span className="text-danger">*</span>
                                        </label>
                                        <input dir={dir}
                                            type="text"
                                            className="form-control"
                                            maxLength={90}
                                            value={section.title || ""}
                                            onChange={(e) => setField("title", e.target.value)}
                                        />
                                        <div className="form-text fsz-11 d-flex justify-content-between">
                                            <span>{t("pages.maxChars", { count: 90 })}</span>
                                            <span>{String(section.title || "").length}/90</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.intro")}</label>
                                        <textarea dir={dir}
                                            className="form-control"
                                            rows={4}
                                            maxLength={240}
                                            value={section.intro_text || ""}
                                            onChange={(e) => setField("intro_text", e.target.value)}
                                        />
                                        <div className="form-text fsz-11 d-flex justify-content-between">
                                            <span>{t("pages.maxChars", { count: 240 })}</span>
                                            <span>{String(section.intro_text || "").length}/240</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSection.id === "directory" && (
                                <div className="col-12">
                                    <p className="fsz-13 fw-600 mb-2">{t("pages.fromModule")}</p>
                                    <p className="fsz-12 text-muted mb-0">
                                        {t("pages.directoryNote")}
                                    </p>
                                    <Link href="/dashboard/companies" className="btn btn-outline-primary fsz-12 mt-3">
                                        {t("pages.manageCompanies")}
                                        <i className="fal fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {(prevSection || nextSection) && (
                        <div className="page-editor__next">
                            {prevSection ? (
                                <button type="button" className="btn btn-outline-secondary fsz-12" onClick={() => setActiveSectionId(prevSection.id)}>
                                    <i className="fal fa-arrow-left me-2"></i>
                                    {t(prevSection.titleKey)}
                                </button>
                            ) : (
                                <span />
                            )}
                            {nextSection && (
                                <button type="button" className="btn btn-outline-secondary fsz-12" onClick={() => setActiveSectionId(nextSection.id)}>
                                    {t(nextSection.titleKey)}
                                    <i className="fal fa-arrow-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
