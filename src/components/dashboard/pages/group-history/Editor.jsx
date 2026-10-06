"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, GROUP_VALUES, JOURNEY_MILESTONES, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", title: "Hero", fieldsCount: 2 },
    { id: "our_journey", number: "02", title: "Our journey", fieldsCount: 31 },
    { id: "vision_mission", number: "03", title: "Vision & mission", fieldsCount: 2 },
    { id: "values", number: "04", title: "Values", fieldsCount: 12 },
    { id: "group_structure", number: "05", title: "Group structure", fieldsCount: 1 },
    { id: "vision_2030", number: "06", title: "Vision 2030", fieldsCount: 3 },
];

export default function GroupHistoryEditor() {
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
            our_journey: {
                ...defaultContent.our_journey,
                ...(page.content.our_journey || {}),
                milestones:
                    page.content.our_journey?.milestones?.length
                        ? page.content.our_journey.milestones
                        : JOURNEY_MILESTONES.map((item) => ({ ...item })),
            },
            vision_mission: {
                ...defaultContent.vision_mission,
                ...(page.content.vision_mission || {}),
            },
            values: {
                ...defaultContent.values,
                ...(page.content.values || {}),
                items:
                    page.content.values?.items?.length
                        ? page.content.values.items
                        : GROUP_VALUES.map((item) => ({ ...item })),
            },
            group_structure: {
                ...defaultContent.group_structure,
                ...(page.content.group_structure || {}),
            },
            vision_2030: {
                ...defaultContent.vision_2030,
                ...(page.content.vision_2030 || {}),
            },
        });
    }, [page]);

    const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection.id);
    const prevSection = activeIndex > 0 ? SECTIONS[activeIndex - 1] : null;
    const nextSection = SECTIONS[activeIndex + 1] || null;
    const section = content[activeSection.id] || {};
    const milestones = section.milestones || [];
    const valueItems = section.items || [];

    const setField = (key, value) => {
        setContent((prev) => ({
            ...prev,
            [activeSection.id]: { ...(prev[activeSection.id] || {}), [key]: value },
        }));
    };

    const setMilestone = (index, key, value) => {
        setContent((prev) => {
            const current = prev.our_journey || {};
            const list = [...(current.milestones || [])];
            list[index] = { ...(list[index] || {}), [key]: value };
            return {
                ...prev,
                our_journey: { ...current, milestones: list },
            };
        });
    };

    const setValueItem = (index, key, value) => {
        setContent((prev) => {
            const current = prev.values || {};
            const list = [...(current.items || [])];
            list[index] = { ...(list[index] || {}), [key]: value };
            return {
                ...prev,
                values: { ...current, items: list },
            };
        });
    };

    const handleCancel = () => router.push("/dashboard/pages");
    const handlePreview = () => window.open(page?.url || "/group-history", "_blank", "noopener,noreferrer");

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
                        <span className="fsz-12 text-muted">{activeSection.fieldsCount} editable fields</span>
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
                                    </div>
                                </>
                            )}

                            {activeSection.id === "our_journey" && (
                                <>
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
                                    </div>

                                    {milestones.map((item, index) => (
                                        <div className="col-12" key={`milestone-${index}`}>
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <label className="form-label fsz-12 text-muted">Year</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={item.year || ""}
                                                        onChange={(e) => setMilestone(index, "year", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-9">
                                                    <label className="form-label fsz-12 text-muted">Milestone</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={2}
                                                        value={item.milestone || ""}
                                                        onChange={(e) => setMilestone(index, "milestone", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {activeSection.id === "vision_mission" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            Vision <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            value={section.vision || ""}
                                            onChange={(e) => setField("vision", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            Mission <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            value={section.mission || ""}
                                            onChange={(e) => setField("mission", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection.id === "values" && (
                                <>
                                    {valueItems.map((item, index) => (
                                        <div className="col-12" key={`value-${index}`}>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="form-label fsz-12 text-muted">Value</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={item.value || ""}
                                                        onChange={(e) => setValueItem(index, "value", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-8">
                                                    <label className="form-label fsz-12 text-muted">Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={2}
                                                        value={item.description || ""}
                                                        onChange={(e) => setValueItem(index, "description", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {activeSection.id === "group_structure" && (
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
                                        The structure is built automatically from the Companies module (Subsidiary / Joint Venture).
                                    </p>
                                    <Link href="/dashboard/companies" className="btn btn-outline-primary fsz-12 mt-3">
                                        Manage in Companies
                                        <i className="fal fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            )}

                            {activeSection.id === "vision_2030" && (
                                <>
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
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Text</label>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            value={section.text || ""}
                                            onChange={(e) => setField("text", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Local content figure</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={section.local_content_figure || ""}
                                            onChange={(e) => setField("local_content_figure", e.target.value)}
                                        />
                                    </div>
                                </>
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
