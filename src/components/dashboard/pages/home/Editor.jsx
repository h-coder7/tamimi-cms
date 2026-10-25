"use client";

import { useI18n } from "@/hooks/useI18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import FileUpload from "@/components/shared/FileUpload";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { useCompanies } from "@/hooks/useCompanies";
import { publicPath } from "@/utils/publicPath";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.heroVideo", fieldsCount: 8 },
    { id: "key_message", number: "02", titleKey: "pages.section.keyMessage", fieldsCount: 8 },
    { id: "key_figures", number: "03", titleKey: "pages.section.keyFigures", fieldsCount: 8 },
    { id: "industries", number: "04", titleKey: "pages.section.industries", fieldsCount: 1, manageLink: { href: "/dashboard/industries", labelKey: "pages.manageIndustries" } },
    { id: "our_companies", number: "05", titleKey: "pages.section.companies", fieldsCount: 2 },
    { id: "featured_projects", number: "06", titleKey: "pages.section.featuredProjects", fieldsCount: 1, manageLink: { href: "/dashboard/projects", labelKey: "pages.manageProjects" } },
    { id: "clients_partners", number: "07", titleKey: "pages.section.clients", fieldsCount: 1, manageLink: { href: "/dashboard/clients-partners", labelKey: "pages.manageClients" } },
    { id: "media_center", number: "08", titleKey: "pages.section.media", fieldsCount: 1, manageLink: { href: "/dashboard/posts", labelKey: "pages.managePosts" } },
    { id: "cta", number: "09", titleKey: "pages.section.cta", fieldsCount: 5 },
];

const VIDEO_ACCEPT = { "video/mp4": [".mp4"], "video/webm": [".webm"] };
const IMAGE_ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };

function filesFromValue(value, type) {
    if (!value) return [];
    return [{
        preview: value,
        type: type === "video" ? "video/mp4" : "image/jpeg",
        name: type === "video" ? "video.mp4" : "image.jpg",
    }];
}

export default function HomeEditor() {
    const { t, isRtl } = useI18n();
    const dir = isRtl ? "rtl" : "ltr";
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const { data: companies = [] } = useCompanies();
    const updateMutation = useUpdateCmsPage();

    const [activeSectionId, setActiveSectionId] = useState("hero");
    const [content, setContent] = useState(defaultContent);

    useEffect(() => {
        if (!page?.content) return;
        const next = { ...defaultContent, ...page.content };
        const selected = next.our_companies?.selected_companies;
        if (Array.isArray(selected) && companies.length > 0) {
            const validCodes = new Set(companies.map((c) => c.code).filter(Boolean));
            next.our_companies = {
                ...next.our_companies,
                selected_companies: selected.filter((code) => validCodes.has(code)),
            };
        }
        setContent(next);
    }, [page, companies]);

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

    const toggleCompany = (code) => {
        const current = Array.isArray(section.selected_companies) ? section.selected_companies : [];
        const exists = current.includes(code);
        if (!exists && current.length >= 6) return;
        setField("selected_companies", exists ? current.filter((c) => c !== code) : [...current, code]);
    };

    const handleCancel = () => router.push("/dashboard/pages");
    const handlePreview = () => window.open(page?.url || "/", "_blank", "noopener,noreferrer");

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
                            {activeSection.number} — {t(activeSection.titleKey)}
                        </h6>
                        <span className="fsz-12 text-muted">{t("pages.editableFields", { count: activeSection.fieldsCount })}</span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.headline")} <span className="text-danger">*</span></label>
                                        <input dir={dir} type="text" className="form-control" maxLength={90} value={section.headline || ""} onChange={(e) => setField("headline", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.supporting")}</label>
                                        <textarea dir={dir} className="form-control" rows={4} maxLength={240} value={section.supporting_text || ""} onChange={(e) => setField("supporting_text", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.primaryLabel")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.primary_btn_label || ""} onChange={(e) => setField("primary_btn_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.primaryLink")}</label>
                                        <input dir="ltr" type="text" className="form-control" value={section.primary_btn_link || ""} onChange={(e) => setField("primary_btn_link", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.secondaryLabel")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.secondary_btn_label || ""} onChange={(e) => setField("secondary_btn_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.secondaryLink")}</label>
                                        <input dir="ltr" type="text" className="form-control" value={section.secondary_btn_link || ""} onChange={(e) => setField("secondary_btn_link", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.video")}</label>
                                        <FileUpload
                                            files={filesFromValue(section.background_video, "video")}
                                            onFilesChange={(files) => setField("background_video", files?.[0]?.preview || "")}
                                            maxFiles={1}
                                            accept={VIDEO_ACCEPT}
                                            title={t("pages.uploadVideo")}
                                            hint={t("pages.videoFormats")}
                                        />
                                        <input
                                            type="url"
                                            dir="ltr"
                                            className="form-control mt-2"
                                            placeholder={t("pages.pasteVideo")}
                                            value={section.background_video && !String(section.background_video).startsWith("blob:") ? section.background_video : ""}
                                            onChange={(e) => setField("background_video", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.fallback")}</label>
                                        <FileUpload
                                            files={filesFromValue(section.fallback_image, "image")}
                                            onFilesChange={(files) => setField("fallback_image", files?.[0]?.preview || "")}
                                            maxFiles={1}
                                            accept={IMAGE_ACCEPT}
                                            title={t("pages.uploadImage")}
                                            hint={t("pages.videoHint")}
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection.id === "key_message" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.eyebrow")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.eyebrow || ""} onChange={(e) => setField("eyebrow", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.title")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.title || ""} onChange={(e) => setField("title", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.paragraph")}</label>
                                        <textarea dir={dir} className="form-control" rows={4} value={section.paragraph || ""} onChange={(e) => setField("paragraph", e.target.value)} />
                                    </div>
                                    {[1, 2, 3].map((n) => (
                                        <div className="col-12" key={n}>
                                            <label className="form-label fsz-12 text-muted">{t("pages.fields.pointTitle", { n })}</label>
                                            <input dir={dir} type="text" className="form-control mb-2" value={section[`point_${n}_title`] || ""} onChange={(e) => setField(`point_${n}_title`, e.target.value)} />
                                            <label className="form-label fsz-12 text-muted">{t("pages.fields.pointText", { n })}</label>
                                            <textarea dir={dir} className="form-control" rows={3} value={section[`point_${n}_text`] || ""} onChange={(e) => setField(`point_${n}_text`, e.target.value)} />
                                        </div>
                                    ))}
                                </>
                            )}

                            {activeSection.id === "key_figures" &&
                                [1, 2, 3, 4].map((n) => (
                                    <div className="col-md-6" key={n}>
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.figureValue", { n })}</label>
                                        <input dir={dir} type="text" className="form-control mb-2" value={section[`figure_${n}_value`] || ""} onChange={(e) => setField(`figure_${n}_value`, e.target.value)} />
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.figureLabel", { n })}</label>
                                        <input dir={dir} type="text" className="form-control" value={section[`figure_${n}_label`] || ""} onChange={(e) => setField(`figure_${n}_label`, e.target.value)} />
                                    </div>
                                ))}

                            {activeSection.id === "industries" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.industriesManaged")}</p>
                                </div>
                            )}

                            {activeSection.id === "our_companies" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.selectedCompanies")}
                                            <span className="ms-2 text-muted">
                                                ({(section.selected_companies || []).length}/6)
                                            </span>
                                        </label>
                                        <div className="page-editor__company-list">
                                            {companies.map((company) => {
                                                const selected = section.selected_companies || [];
                                                const checked = selected.includes(company.code);
                                                const disabled = !checked && selected.length >= 6;
                                                return (
                                                    <label
                                                        key={company.code}
                                                        className={`page-editor__company-item ${checked ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input mt-0"
                                                            checked={checked}
                                                            disabled={disabled}
                                                            onChange={() => toggleCompany(company.code)}
                                                        />
                                                        <span className="page-editor__company-logo">
                                                            {company.image ? (
                                                                <img src={publicPath(company.image)} alt={company.title} />
                                                            ) : (
                                                                <i className="fal fa-building"></i>
                                                            )}
                                                        </span>
                                                        <span className="page-editor__company-text">
                                                            <strong>{company.code}</strong>
                                                            <span>{company.title}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSection.id === "featured_projects" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.projectsManaged")}</p>
                                </div>
                            )}

                            {activeSection.id === "clients_partners" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.logosManaged")}</p>
                                </div>
                            )}

                            {activeSection.id === "media_center" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.postsManaged")}</p>
                                </div>
                            )}

                            {activeSection.id === "cta" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.title")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.title || ""} onChange={(e) => setField("title", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.button1Label")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.button_1_label || ""} onChange={(e) => setField("button_1_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.button1Link")}</label>
                                        <input dir="ltr" type="text" className="form-control" value={section.button_1_link || ""} onChange={(e) => setField("button_1_link", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.button2Label")}</label>
                                        <input dir={dir} type="text" className="form-control" value={section.button_2_label || ""} onChange={(e) => setField("button_2_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.button2Link")}</label>
                                        <input dir="ltr" type="text" className="form-control" value={section.button_2_link || ""} onChange={(e) => setField("button_2_link", e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>

                        {activeSection.manageLink && (
                            <Link href={activeSection.manageLink.href} className="btn btn-outline-primary fsz-12 mt-3">
                                {t(activeSection.manageLink.labelKey)}
                                <i className="fal fa-arrow-right ms-2"></i>
                            </Link>
                        )}
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
