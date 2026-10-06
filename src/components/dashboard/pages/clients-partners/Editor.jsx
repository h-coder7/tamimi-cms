"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", title: "Hero", fieldsCount: 2 },
    { id: "logos", number: "02", title: "Logos", fieldsCount: 0, badge: "Sample logos" },
    { id: "collaboration_highlights", number: "03", title: "Collaboration highlights", fieldsCount: 1 },
];

export default function ClientsPartnersEditor() {
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
            logos: { ...defaultContent.logos, ...(page.content.logos || {}) },
            collaboration_highlights: {
                ...defaultContent.collaboration_highlights,
                ...(page.content.collaboration_highlights || {}),
            },
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
        return <div className="text-center py-5 text-muted">Loading page editor...</div>;
    }

    if (!page) {
        return (
            <div className="text-center py-5">
                <p className="text-muted mb-3">Page not found</p>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCancel}>
                    Back to Pages
                </button>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title={`Edit content — ${page.page}`}
                icon="fal fa-file-edit"
                titleCol="col-lg-5"
                actionCol="col-lg-7"
            >
                <button type="button" className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0" onClick={handlePreview}>
                    <span className="txt">Preview page</span>
                    <i className="fal fa-external-link ms-2"></i>
                </button>
                <button type="button" className="alert alert-light rounded-pill py-2 px-3 fsz-12 ms-2 border mb-0" onClick={handleCancel}>
                    <span className="txt">Cancel</span>
                </button>
                <button
                    type="button"
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={handleSavePublish}
                    disabled={updateMutation.isPending}
                >
                    <i className="fal fa-check"></i>
                    <span className="txt ms-2">Save & publish</span>
                </button>
            </PageHeader>

            <div className="page-editor mt-4">
                <aside className="page-editor__sidebar table-content p-0 mt-0 mb-0">
                    <div className="page-editor__sidebar-head">
                        <h6 className="mb-0 fsz-13 fw-600">Sections</h6>
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
                                    <span className="page-editor__section-title">{s.title}</span>
                                    {s.badge && (
                                        <span className="badge bg-warning-subtle text-dark border fsz-10 ms-2">
                                            {s.badge}
                                        </span>
                                    )}
                                </span>
                                <i className="fal fa-angle-right text-muted"></i>
                            </button>
                        ))}
                    </div>
                    <div className="page-editor__sidebar-foot">
                        Section order and visibility follow the approved design.
                    </div>
                </aside>

                <section className="page-editor__main table-content mt-0 mb-0">
                    <div className="page-editor__main-head">
                        <h6 className="mb-0 fsz-14 fw-600">
                            {activeSection.number} · {activeSection.title}
                        </h6>
                        <span className="fsz-12 text-muted">
                            {activeSection.fieldsCount
                                ? `${activeSection.fieldsCount} editable fields`
                                : "Content from another module"}
                        </span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            Title <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            maxLength={90}
                                            value={section.title || ""}
                                            onChange={(e) => setField("title", e.target.value)}
                                        />
                                        <div className="form-text fsz-11 d-flex justify-content-between">
                                            <span>Max 90 characters</span>
                                            <span>{String(section.title || "").length}/90</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Intro text</label>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            maxLength={240}
                                            value={section.intro_text || ""}
                                            onChange={(e) => setField("intro_text", e.target.value)}
                                        />
                                        <div className="form-text fsz-11 d-flex justify-content-between">
                                            <span>Max 240 characters</span>
                                            <span>{String(section.intro_text || "").length}/240</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSection.id === "logos" && (
                                <div className="col-12">
                                    <p className="fsz-13 fw-600 mb-2">Content from another module</p>
                                    <p className="fsz-12 text-muted mb-0">
                                        Clients, strategic partners and technology alliances come from the Clients & Partners module.
                                    </p>
                                    <Link href="/dashboard/clients-partners" className="btn btn-outline-primary fsz-12 mt-3">
                                        Manage in Clients & Partners
                                        <i className="fal fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            )}

                            {activeSection.id === "collaboration_highlights" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">
                                        Section title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={section.section_title || ""}
                                        onChange={(e) => setField("section_title", e.target.value)}
                                    />
                                    <p className="fsz-12 text-muted mt-3 mb-0">
                                        Highlights list the joint ventures and their international partners from the Companies module.
                                    </p>
                                    <Link href="/dashboard/companies" className="btn btn-outline-primary fsz-12 mt-3">
                                        Manage in Companies
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
                                    {prevSection.title}
                                </button>
                            ) : (
                                <span />
                            )}
                            {nextSection && (
                                <button type="button" className="btn btn-outline-secondary fsz-12" onClick={() => setActiveSectionId(nextSection.id)}>
                                    {nextSection.title}
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
