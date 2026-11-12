"use client";

import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "section_1", number: "01", titleKey: "pages.section.careersIntro", fieldsCount: 2 },
    { id: "why_join_us", number: "02", titleKey: "pages.whyJoinUs", fieldsCount: 12 },
];

export default function CareersEditor() {
    const { t, isRtl } = useI18n();
    const dir = isRtl ? "rtl" : "ltr";
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const updateMutation = useUpdateCmsPage();

    const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
    const [draft, setContent] = useState(null);
    const content = draft || { ...defaultContent, ...page?.content };

    const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection.id);
    const prevSection = activeIndex > 0 ? SECTIONS[activeIndex - 1] : null;
    const nextSection = SECTIONS[activeIndex + 1] || null;
    const section = content[activeSection.id] || {};

    const setField = (key, value) => {
        setContent((prev) => ({
            ...(prev || content),
            [activeSection.id]: { ...((prev || content)[activeSection.id] || {}), [key]: value },
        }));
    };

    const handleCancel = () => router.push("/dashboard/pages");
    const handlePreview = () => window.open(page?.url || pageMeta.url, "_blank", "noopener,noreferrer");

    const handleSavePublish = async () => {
        const cards = content.why_join_us?.cards || [];
        if (cards.length !== 4 || cards.some(card => [card.title, card.description].some(value => !value?.en?.trim() && !value?.ar?.trim()))) {
            toast.error(t("pages.whyJoinRequired")); setActiveSectionId("why_join_us"); return;
        }
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
                            {activeSection.number} — {t(activeSection.titleKey)}
                        </h6>
                        <span className="fsz-12 text-muted">{t("pages.editableFields", { count: activeSection.fieldsCount })}</span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">

                            {activeSection.id === "section_1" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.title")}</label>
                                        <input dir={dir}
                                            type="text"
                                            className="form-control"
                                            maxLength={90}
                                            value={section.title || ""}
                                            onChange={(e) => setField("title", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.body")}</label>
                                        <textarea dir={dir}
                                            className="form-control"
                                            rows={4}
                                            maxLength={320}
                                            value={section.body || ""}
                                            onChange={(e) => setField("body", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection.id === "why_join_us" && (section.cards || []).map((card, index) => {
                                const setCard = (key, value) => setField("cards", section.cards.map((item, i) => i === index ? { ...item, [key]: value } : item));
                                return <div className="col-12" key={card.id}>
                                    <div className="border rounded-3 p-3 bg-light">
                                        <h6 className="fsz-13 fw-600 mb-3">{t("pages.card")} {index + 1}</h6>
                                        <label className="form-label fsz-12 text-muted" htmlFor={`career-icon-${card.id}`}>{t("pages.icon")}</label>
                                        <select id={`career-icon-${card.id}`} className="form-select mb-3" value={card.icon} onChange={e => setCard("icon", e.target.value)}>
                                            {["users", "briefcase", "graduation-cap", "heart", "globe", "chart-line", "shield", "star"].map(icon => <option key={icon} value={icon}>{t(`pages.careerIcon.${icon}`)}</option>)}
                                        </select>
                                        {["title", "description"].map(key => <div className="mb-3" key={key}>
                                            <label className="form-label fsz-12 text-muted">{key === "title" ? t("pages.fields.title") : t("pages.careerDescription")} <span className="text-danger">*</span></label>
                                            <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}>
                                                <span className="fsz-10 text-muted">{lang.toUpperCase()}</span>
                                                {key === "title" ? <input aria-label={`${t("pages.card")} ${index + 1} ${t("pages.fields.title")} ${lang.toUpperCase()}`} className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={120} value={card[key]?.[lang] || ""} onChange={e => setCard(key, { ...card[key], [lang]: e.target.value })} /> : <textarea aria-label={`${t("pages.card")} ${index + 1} ${t("pages.careerDescription")} ${lang.toUpperCase()}`} className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} rows={3} maxLength={1000} value={card[key]?.[lang] || ""} onChange={e => setCard(key, { ...card[key], [lang]: e.target.value })} />}
                                            </div>)}</div>
                                        </div>)}
                                    </div>
                                </div>;
                            })}
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
