"use client";

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
    { id: "hero", number: "01", title: "Hero (video)", fieldsCount: 8 },
    { id: "key_message", number: "02", title: "Key Message", fieldsCount: 8 },
    { id: "key_figures", number: "03", title: "Key Figures", fieldsCount: 8 },
    { id: "industries", number: "04", title: "Industries We Power", fieldsCount: 1, manageLink: { href: "/dashboard/industries", label: "Manage Industries" } },
    { id: "our_companies", number: "05", title: "Our Companies", fieldsCount: 2 },
    { id: "featured_projects", number: "06", title: "Featured Projects", fieldsCount: 1, manageLink: { href: "/dashboard/projects", label: "Manage Projects" } },
    { id: "clients_partners", number: "07", title: "Clients & Partners", fieldsCount: 1, manageLink: { href: "/dashboard/clients-partners", label: "Manage Clients & Partners" } },
    { id: "media_center", number: "08", title: "Media Center", fieldsCount: 1, manageLink: { href: "/dashboard/posts", label: "Manage Posts" } },
    { id: "cta", number: "09", title: "CTA Banner", fieldsCount: 5 },
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
                            {activeSection.number} — {activeSection.title}
                        </h6>
                        <span className="fsz-12 text-muted">{activeSection.fieldsCount} editable fields</span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Headline <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" maxLength={90} value={section.headline || ""} onChange={(e) => setField("headline", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Supporting text</label>
                                        <textarea className="form-control" rows={4} maxLength={240} value={section.supporting_text || ""} onChange={(e) => setField("supporting_text", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Primary button label</label>
                                        <input type="text" className="form-control" value={section.primary_btn_label || ""} onChange={(e) => setField("primary_btn_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Primary button link</label>
                                        <input type="text" className="form-control" value={section.primary_btn_link || ""} onChange={(e) => setField("primary_btn_link", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Secondary button label</label>
                                        <input type="text" className="form-control" value={section.secondary_btn_label || ""} onChange={(e) => setField("secondary_btn_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Secondary button link</label>
                                        <input type="text" className="form-control" value={section.secondary_btn_link || ""} onChange={(e) => setField("secondary_btn_link", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Background video</label>
                                        <FileUpload
                                            files={filesFromValue(section.background_video, "video")}
                                            onFilesChange={(files) => setField("background_video", files?.[0]?.preview || "")}
                                            maxFiles={1}
                                            accept={VIDEO_ACCEPT}
                                            title="Upload video"
                                            hint="MP4 or WebM"
                                        />
                                        <input
                                            type="url"
                                            className="form-control mt-2"
                                            placeholder="Or paste YouTube / Vimeo link"
                                            value={section.background_video && !String(section.background_video).startsWith("blob:") ? section.background_video : ""}
                                            onChange={(e) => setField("background_video", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Fallback image</label>
                                        <FileUpload
                                            files={filesFromValue(section.fallback_image, "image")}
                                            onFilesChange={(files) => setField("fallback_image", files?.[0]?.preview || "")}
                                            maxFiles={1}
                                            accept={IMAGE_ACCEPT}
                                            title="Upload image"
                                            hint="Shown when video cannot play"
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection.id === "key_message" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Eyebrow</label>
                                        <input type="text" className="form-control" value={section.eyebrow || ""} onChange={(e) => setField("eyebrow", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Title</label>
                                        <input type="text" className="form-control" value={section.title || ""} onChange={(e) => setField("title", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Paragraph</label>
                                        <textarea className="form-control" rows={4} value={section.paragraph || ""} onChange={(e) => setField("paragraph", e.target.value)} />
                                    </div>
                                    {[1, 2, 3].map((n) => (
                                        <div className="col-12" key={n}>
                                            <label className="form-label fsz-12 text-muted">Point {n} — title</label>
                                            <input type="text" className="form-control mb-2" value={section[`point_${n}_title`] || ""} onChange={(e) => setField(`point_${n}_title`, e.target.value)} />
                                            <label className="form-label fsz-12 text-muted">Point {n} — text</label>
                                            <textarea className="form-control" rows={3} value={section[`point_${n}_text`] || ""} onChange={(e) => setField(`point_${n}_text`, e.target.value)} />
                                        </div>
                                    ))}
                                </>
                            )}

                            {activeSection.id === "key_figures" &&
                                [1, 2, 3, 4].map((n) => (
                                    <div className="col-md-6" key={n}>
                                        <label className="form-label fsz-12 text-muted">Figure {n} — value</label>
                                        <input type="text" className="form-control mb-2" value={section[`figure_${n}_value`] || ""} onChange={(e) => setField(`figure_${n}_value`, e.target.value)} />
                                        <label className="form-label fsz-12 text-muted">Figure {n} — label</label>
                                        <input type="text" className="form-control" value={section[`figure_${n}_label`] || ""} onChange={(e) => setField(`figure_${n}_label`, e.target.value)} />
                                    </div>
                                ))}

                            {activeSection.id === "industries" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">Section title</label>
                                    <input type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">Industry cards are managed from the Industries module.</p>
                                </div>
                            )}

                            {activeSection.id === "our_companies" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Section title</label>
                                        <input type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            Selected companies
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
                                    <label className="form-label fsz-12 text-muted">Section title</label>
                                    <input type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">Featured projects are managed from the Projects module.</p>
                                </div>
                            )}

                            {activeSection.id === "clients_partners" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">Section title</label>
                                    <input type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">Logos are managed from Clients & Partners.</p>
                                </div>
                            )}

                            {activeSection.id === "media_center" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">Section title</label>
                                    <input type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">Posts are managed from the Posts module.</p>
                                </div>
                            )}

                            {activeSection.id === "cta" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">Title</label>
                                        <input type="text" className="form-control" value={section.title || ""} onChange={(e) => setField("title", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Button 1 label</label>
                                        <input type="text" className="form-control" value={section.button_1_label || ""} onChange={(e) => setField("button_1_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Button 1 link</label>
                                        <input type="text" className="form-control" value={section.button_1_link || ""} onChange={(e) => setField("button_1_link", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Button 2 label</label>
                                        <input type="text" className="form-control" value={section.button_2_label || ""} onChange={(e) => setField("button_2_label", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">Button 2 link</label>
                                        <input type="text" className="form-control" value={section.button_2_link || ""} onChange={(e) => setField("button_2_link", e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>

                        {activeSection.manageLink && (
                            <Link href={activeSection.manageLink.href} className="btn btn-outline-primary fsz-12 mt-3">
                                {activeSection.manageLink.label}
                                <i className="fal fa-arrow-right ms-2"></i>
                            </Link>
                        )}
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
