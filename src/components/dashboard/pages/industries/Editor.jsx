"use client";

import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, pageMeta } from "./data";
import PageImageUpload from "../_shared/PageImageUpload";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.hero", fieldsCount: 5 },
    { id: "industry_cards", number: "02", titleKey: "pages.section.industryCards", fieldsCount: 0 },
    { id: "value_chain", number: "03", titleKey: "pages.section.valueChain", fieldsCount: 0 },
];

export default function IndustriesEditor() {
    const { t, isRtl } = useI18n();
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const updateMutation = useUpdateCmsPage();

    const [activeSectionId, setActiveSectionId] = useState("hero");
    const [draft, setContent] = useState(null);
    const content = draft || { ...defaultContent, ...page?.content, hero: { ...defaultContent.hero, ...page?.content?.hero }, industry_cards: { ...defaultContent.industry_cards, ...page?.content?.industry_cards } };

    const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection.id);
    const prevSection = activeIndex > 0 ? SECTIONS[activeIndex - 1] : null;
    const nextSection = SECTIONS[activeIndex + 1] || null;
    const section = content[activeSection.id] || {};

    const valueForLocale = (value, locale) => typeof value === "string" ? value : (value?.[locale] || value?.en || "");
    const setLocalizedField = (key, locale, value) => {
        const current = section[key];
        const localized = current && typeof current === "object" ? current : { en: current || "", ar: "" };
        setField(key, { ...localized, [locale]: value });
    };

    const setField = (key, value) => {
        setContent((prev) => ({
            ...(prev || content),
            [activeSection.id]: { ...((prev || content)[activeSection.id] || {}), [key]: value },
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
                                    {s.badgeKey && (
                                        <span className="badge bg-warning-subtle text-dark border fsz-10 ms-2">
                                            {t(s.badgeKey)}
                                        </span>
                                    )}
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
                                    {[{ key: "title", label: t("pages.fields.title"), max: 90 }, { key: "intro_text", label: t("pages.fields.intro"), max: 240 }].map(({ key, label, max }) => (
                                        <div className="col-12" key={key}>
                                            <label className="form-label fsz-12 text-muted">{label} <span className="text-danger">*</span></label>
                                            <div className="row g-2">{["en", "ar"].map((locale) => <div className="col-md-6" key={locale}>
                                                <label className="form-text fsz-11" htmlFor={`industries-hero-${key}-${locale}`}>{locale.toUpperCase()}</label>
                                                {key === "title" ? <input id={`industries-hero-${key}-${locale}`} dir={locale === "ar" ? "rtl" : "ltr"} className="form-control" maxLength={max} value={valueForLocale(section[key], locale)} onChange={(e) => setLocalizedField(key, locale, e.target.value)} /> : <textarea id={`industries-hero-${key}-${locale}`} dir={locale === "ar" ? "rtl" : "ltr"} className="form-control" rows={3} maxLength={max} value={valueForLocale(section[key], locale)} onChange={(e) => setLocalizedField(key, locale, e.target.value)} />}
                                                <div className="form-text fsz-11">{valueForLocale(section[key], locale).length}/{max}</div>
                                            </div>)}</div>
                                        </div>
                                    ))}
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{isRtl ? "صورة خلفية الصفحة" : "Background image"}</label>
                                        <PageImageUpload slug="industries" value={section.background_image || ""} onChange={(value) => setField("background_image", value || null)} maxBytes={5 * 1024 * 1024} title={isRtl ? "ارفع صورة الخلفية" : "Upload background image"} accept={{"image/jpeg":[".jpg",".jpeg"],"image/png":[".png"],"image/webp":[".webp"]}} />
                                    </div>
                                </>
                            )}

                            {activeSection.id === "industry_cards" && (
                                <div className="col-12">
                                    <p className="fsz-13 fw-600 mb-2">{t("pages.fromModule")}</p>
                                    <p className="fsz-12 text-muted mb-0">
                                        {t("pages.industryCardsNote")}
                                    </p>
                                    <Link href="/dashboard/industries" className="btn btn-outline-primary fsz-12 mt-3">
                                        {t("pages.manageInIndustries")}
                                        <i className="fal fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            )}
                            {activeSection.id === "value_chain" && (
                                <div className="col-12">
                                    <p className="fsz-13 fw-600 mb-2">{t("pages.fromModule")}</p>
                                    <p className="fsz-12 text-muted mb-0">{t("pages.valueChainNote")}</p>
                                    <Link href="/dashboard/industries" className="btn btn-outline-primary fsz-12 mt-3">
                                        {t("pages.manageInIndustries")}
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
