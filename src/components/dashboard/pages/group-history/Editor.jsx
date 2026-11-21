"use client";

import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { defaultContent, GROUP_VALUES, JOURNEY_MILESTONES, pageMeta } from "./data";
import TeamEditor, { validateTeam } from "./TeamEditor";
import toast from "react-hot-toast";
import OurStoryEditor, { isValidStory } from "./OurStoryEditor";
import PageImageUpload from "../_shared/PageImageUpload";
import FileUpload from "@/components/shared/FileUpload";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import api, { getApiErrorMessage } from "@/app/api/api";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.hero", fieldsCount: 3 },
    { id: "our_story", number: "02", titleKey: "pages.section.ourStory", fieldsCount: 12 },
    { id: "our_journey", number: "03", titleKey: "pages.section.journey", fieldsCount: 31 },
    { id: "values", number: "04", titleKey: "pages.section.values", fieldsCount: 0 },
    { id: "group_structure", number: "05", titleKey: "pages.section.structure", fieldsCount: 2 },
    { id: "team", number: "06", titleKey: "pages.section.team", fieldsCount: 8 },
];

export default function GroupHistoryEditor() {
    const { t, isRtl } = useI18n();
    const dir = isRtl ? "rtl" : "ltr";
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const updateMutation = useUpdateCmsPage();

    const [activeSectionId, setActiveSectionId] = useState("hero");
    const [draft, setDraft] = useState(null);
    const [teamDirty, setTeamDirty] = useState(false);
    const [teamUploading, setTeamUploading] = useState(false);
    const [aboutUploading, setAboutUploading] = useState(false);

    const savedContent = page?.content || {};
    const content = draft || {
        ...defaultContent,
        ...savedContent,
        our_journey: {
            ...defaultContent.our_journey,
            ...(savedContent.our_journey || {}),
            milestones: Array.isArray(savedContent.our_journey?.milestones)
                ? savedContent.our_journey.milestones
                : JOURNEY_MILESTONES.map((item) => ({ ...item })),
        },
        values: {
            ...defaultContent.values,
            ...(savedContent.values || {}),
            items: Array.isArray(savedContent.values?.items)
                ? savedContent.values.items
                : GROUP_VALUES.map((item) => ({ ...item })),
        },
        group_structure: { ...defaultContent.group_structure, ...(savedContent.group_structure || {}) },
    };
    const setContent = (change) => setDraft((current) => {
        const previous = current || content;
        return typeof change === "function" ? change(previous) : change;
    });

    const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection.id);
    const prevSection = activeIndex > 0 ? SECTIONS[activeIndex - 1] : null;
    const nextSection = SECTIONS[activeIndex + 1] || null;
    const section = content[activeSection.id] || {};
    const milestones = section.milestones || [];

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

    const handleCancel = () => router.push("/dashboard/pages");
    const handlePreview = () => window.open(page?.url || "/about", "_blank", "noopener,noreferrer");

    const handleSavePublish = async () => {
        const desc = content.group_structure?.description;
        if (!(typeof desc === "string" ? desc.trim() : (desc?.en?.trim() && desc?.ar?.trim()))) {
            setActiveSectionId("group_structure"); toast.error(t("pages.structureDescriptionRequired")); return;
        }
        if (content.our_story && !isValidStory(content.our_story)) {
            setActiveSectionId("our_story"); toast.error(t("pages.storyRequired")); return;
        }
        if (teamDirty && !validateTeam(content.team)) {
            setActiveSectionId("team");
            toast.error(t("pages.team.validation"));
            return;
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
                    disabled={updateMutation.isPending || teamUploading || aboutUploading}
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
                                disabled={teamUploading}
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
                        <span className="fsz-12 text-muted">{t("pages.editableFields", { count: activeSection.id === "team" ? 8 + (content.team?.members?.length || 0) * 6 : activeSection.fieldsCount })}</span>
                    </div>

                    <div className="page-editor__fields">
                        <div className="row g-3">
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.title")} <span className="text-danger">*</span>
                                        </label>
                                        <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><input dir={lang === "ar" ? "rtl" : "ltr"} className="form-control" maxLength={90} value={typeof section.title === "string" ? (lang === "en" ? section.title : "") : section.title?.[lang] || ""} onChange={e => setField("title", { ...(typeof section.title === "object" ? section.title : { en: section.title || "", ar: "" }), [lang]: e.target.value })} /></div>)}</div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">{t("pages.fields.intro")}</label>
                                        <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><textarea dir={lang === "ar" ? "rtl" : "ltr"} className="form-control" rows={4} maxLength={240} value={typeof section.intro_text === "string" ? (lang === "en" ? section.intro_text : "") : section.intro_text?.[lang] || ""} onChange={e => setField("intro_text", { ...(typeof section.intro_text === "object" ? section.intro_text : { en: section.intro_text || "", ar: "" }), [lang]: e.target.value })} /></div>)}</div>
                                    </div>
                                    <div className="col-12"><PageImageUpload slug="about" value={section.background_image || ""} onChange={value => setField("background_image", value)} onBusy={setAboutUploading} title={isRtl ? "صورة خلفية About" : "About hero background image"} maxBytes={5 * 1024 * 1024} accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }} /></div>
                                </>
                            )}

                            {activeSection.id === "our_journey" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.sectionTitle")} <span className="text-danger">*</span>
                                        </label>
                                            <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><input dir={lang === "ar" ? "rtl" : "ltr"} className="form-control" value={typeof section.section_title === "string" ? (lang === "en" ? section.section_title : "") : section.section_title?.[lang] || ""} onChange={e => setField("section_title", { ...(typeof section.section_title === "object" ? section.section_title : { en: section.section_title || "", ar: "" }), [lang]: e.target.value })} /></div>)}</div>
                                    </div>

                                    {milestones.map((item, index) => (
                                        <div className="col-12" key={`milestone-${index}`}>
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.year")}</label>
                                                    <input dir={dir}
                                                        type="text"
                                                        className="form-control"
                                                        value={item.year || ""}
                                                        onChange={(e) => setMilestone(index, "year", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-9">
                                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.milestone")}</label>
                                                    <div className="row g-2">{["en", "ar"].map(lang => <div className="col-12" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><textarea dir={lang === "ar" ? "rtl" : "ltr"} className="form-control" rows={2} maxLength={240} value={typeof item.milestone === "string" ? (lang === "en" ? item.milestone : "") : item.milestone?.[lang] || ""} onChange={e => setMilestone(index, "milestone", { ...(typeof item.milestone === "object" ? item.milestone : { en: item.milestone || "", ar: "" }), [lang]: e.target.value })} /></div>)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {activeSection.id === "our_story" && (
                                <div className="col-12"><OurStoryEditor value={content.our_story} onBusy={setAboutUploading} onChange={(our_story) => setContent(prev => ({ ...prev, our_story }))} /></div>
                            )}

                            {activeSection.id === "values" && (
                                <div className="col-12">
                                    <p className="fsz-12 text-muted mb-0">{t("pages.valuesManaged")}</p>
                                    <Link href="/dashboard/pages/1/edit/#our_values" className="btn btn-outline-primary fsz-12 mt-3">
                                        {t("pages.manageValues")} <i className="fal fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            )}

                            {activeSection.id === "team" && (
                                <div className="col-12"><TeamEditor value={content.team || {}} onUploading={setTeamUploading} onChange={(change) => { setTeamDirty(true); setContent(prev => ({ ...prev, team: typeof change === "function" ? change(prev.team || {}) : change })); }} /></div>
                            )}

                            {activeSection.id === "group_structure" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">
                                        {t("pages.fields.sectionTitle")} <span className="text-danger">*</span>
                                    </label>
                                        <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><input dir={lang === "ar" ? "rtl" : "ltr"} className="form-control" value={typeof section.section_title === "string" ? (lang === "en" ? section.section_title : "") : section.section_title?.[lang] || ""} onChange={e => setField("section_title", { ...(typeof section.section_title === "object" ? section.section_title : { en: section.section_title || "", ar: "" }), [lang]: e.target.value })} /></div>)}</div>
                                    <div className="mt-3">
                                        <label className="form-label fsz-12 text-muted">{t("common.description")} <span className="text-danger">*</span></label>
                                        <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><textarea className="form-control" rows={3} maxLength={2000} dir={lang === "ar" ? "rtl" : "ltr"} value={typeof section.description === "string" ? (lang === "en" ? section.description : "") : (section.description?.[lang] || "")} onChange={e => setField("description", { ...(typeof section.description === "object" && section.description ? section.description : { en: section.description || "" }), [lang]: e.target.value })} /></div>)}</div>
                                    </div>
                                    <div className="border-top mt-4 pt-3"><h6>{isRtl ? "الشركة القابضة" : "Holding company"}</h6><div className="row g-2"><div className="col-md-6">{["en", "ar"].map(lang => <div key={lang} className="mb-2"><label className="form-label fsz-12">{isRtl ? "الاسم" : "Name"} ({lang.toUpperCase()})</label><input className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={80} value={section.holding?.name?.[lang] || ""} onChange={e => setField("holding", { ...(section.holding || {}), name: { ...(section.holding?.name || {}), [lang]: e.target.value } })} /></div>)}</div><div className="col-md-6"><label className="form-label fsz-12">{isRtl ? "سنة التأسيس" : "Established year"}</label><input type="number" min="1000" max="9999" className="form-control" value={section.holding?.established_year || ""} onChange={e => setField("holding", { ...(section.holding || {}), established_year: Number(e.target.value) || "" })} /></div><div className="col-12"><HoldingLogoUpload value={section.holding?.logo || ""} onBusy={setAboutUploading} onChange={logo => setField("holding", { ...(section.holding || {}), logo })} isRtl={isRtl} /></div></div></div>
                                    <p className="fsz-12 text-muted mt-3 mb-0">
                                        {t("pages.structureNote")}
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
                                <button type="button" className="btn btn-outline-secondary fsz-12" disabled={teamUploading || aboutUploading} onClick={() => setActiveSectionId(prevSection.id)}>
                                    <i className="fal fa-arrow-left me-2"></i>
                                    {t(prevSection.titleKey)}
                                </button>
                            ) : (
                                <span />
                            )}
                            {nextSection && (
                                <button type="button" className="btn btn-outline-secondary fsz-12" disabled={teamUploading || aboutUploading} onClick={() => setActiveSectionId(nextSection.id)}>
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

function HoldingLogoUpload({ value, onChange, onBusy, isRtl }) {
    const title = isRtl ? "شعار الشركة القابضة (SVG أو PNG، حتى 2 ميجابايت)" : "Holding company logo (SVG or PNG, up to 2 MB)";
    const base = String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "");
    const preview = value ? (/^(https?:|\/)/.test(value) ? value : `${base}/uploads/${value}`) : "";
    return <FileUpload title={title} hint={title} maxFiles={1} accept={{ "image/svg+xml": [".svg"], "image/png": [".png"] }} files={preview ? [{ name: value.split("/").pop(), type: value.endsWith(".svg") ? "image/svg+xml" : "image/png", preview }] : []} onFilesChange={async files => {
        if (!files.length) { onChange(""); return; }
        const file = files[0].file;
        if (!file || file.size > 2 * 1024 * 1024 || !["image/svg+xml", "image/png"].includes(file.type)) { toast.error(isRtl ? "اختر SVG أو PNG حتى 2 ميجابايت" : "Choose an SVG or PNG up to 2 MB"); return; }
        onBusy(true);
        try { const result = await uploadPageMedia("about", file, "about_logo"); if (!result?.path) throw new Error("Upload failed"); onChange(result.path); }
        catch (error) { toast.error(getApiErrorMessage(error, isRtl ? "تعذر رفع الشعار" : "Logo upload failed")); }
        finally { onBusy(false); }
    }} />;
}
