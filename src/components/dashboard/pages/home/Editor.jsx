"use client";

import { useI18n } from "@/hooks/useI18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import PageHeader from "@/components/layout/PageHeader";
import FileUpload from "@/components/shared/FileUpload";
import { useCmsPage, useUpdateCmsPage, uploadPageMedia } from "@/hooks/useCmsPages";
import { useCompanies } from "@/hooks/useCompanies";
import { publicPath } from "@/utils/publicPath";
import { isValidUrlOrPath } from "@/utils/urlValidator";
import SaudiManufacturingEditor from "./SaudiManufacturingEditor";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.heroVideo", fieldsCount: 9 },
    { id: "key_message", number: "02", titleKey: "pages.section.keyMessage", fieldsCount: 8 },
    { id: "our_values", number: "03", titleKey: "pages.section.ourValues", fieldsCount: 10 },
    { id: "industries", number: "04", titleKey: "pages.section.industries", fieldsCount: 1, manageLink: { href: "/dashboard/industries", labelKey: "pages.manageIndustries" } },
    { id: "our_companies", number: "05", titleKey: "pages.section.companies", fieldsCount: 2 },
    { id: "saudi_manufacturing", number: "06", titleKey: "pages.section.saudiManufacturing", fieldsCount: 12 },
    { id: "media_center", number: "07", titleKey: "pages.section.media", fieldsCount: 1, manageLink: { href: "/dashboard/posts", labelKey: "pages.managePosts" } },
];

const VIDEO_ACCEPT = { "video/mp4": [".mp4"], "video/webm": [".webm"] };
const IMAGE_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
};

function filesFromValue(value, type) {
    if (!value) return [];
    return [{
        preview: publicPath(value),
        type: type === "video" ? "video/mp4" : "image/jpeg",
        name: type === "video" ? "video.mp4" : (String(value).split("/").pop() || "image.jpg"),
        url: publicPath(value),
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
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!page?.content) return;
        const next = { ...defaultContent, ...page.content };

        // Normalize hero
        next.hero = {
            ...defaultContent.hero,
            ...(next.hero || {}),
            introductory_heading:
                next.hero?.introductory_heading ||
                next.hero?.introductoryHeading ||
                defaultContent.hero.introductory_heading,
            introductoryHeading:
                next.hero?.introductoryHeading ||
                next.hero?.introductory_heading ||
                defaultContent.hero.introductory_heading,
        };

        // Normalize our_values (exactly 4 cards)
        const defaultCards = defaultContent.our_values.cards;
        const existingCards = Array.isArray(next.our_values?.cards) ? next.our_values.cards : [];
        const mergedCards = defaultCards.map((dc, i) => {
            const match = existingCards.find((c) => c.id === dc.id) || existingCards[i] || {};
            return {
                id: dc.id,
                title: {
                    en: match.title?.en ?? (typeof match.title === "string" ? match.title : dc.title.en),
                    ar: match.title?.ar ?? dc.title.ar,
                },
                description: {
                    en: match.description?.en ?? (typeof match.description === "string" ? match.description : dc.description.en),
                    ar: match.description?.ar ?? dc.description.ar,
                },
                icon: match.icon ?? dc.icon ?? "",
            };
        });
        next.our_values = {
            ...defaultContent.our_values,
            ...(next.our_values || {}),
            title: {
                en: next.our_values?.title?.en ?? (typeof next.our_values?.title === "string" ? next.our_values.title : defaultContent.our_values.title.en),
                ar: next.our_values?.title?.ar ?? defaultContent.our_values.title.ar,
            },
            cards: mergedCards.slice(0, 4),
        };

        // Normalize saudi_manufacturing (exactly 4 features)
        const defaultFeatures = defaultContent.saudi_manufacturing.features;
        const existingFeatures = Array.isArray(next.saudi_manufacturing?.features) ? next.saudi_manufacturing.features : [];
        const mergedFeatures = defaultFeatures.map((df, i) => {
            const match = existingFeatures.find((f) => f.id === df.id) || existingFeatures[i] || {};
            return {
                id: df.id,
                title: {
                    en: match.title?.en ?? (typeof match.title === "string" ? match.title : df.title?.en ?? ""),
                    ar: match.title?.ar ?? df.title?.ar ?? "",
                },
                icon: match.icon || df.icon || "factory",
            };
        });
        next.saudi_manufacturing = {
            ...defaultContent.saudi_manufacturing,
            ...(next.saudi_manufacturing || {}),
            title: {
                en: next.saudi_manufacturing?.title?.en ?? (typeof next.saudi_manufacturing?.title === "string" ? next.saudi_manufacturing.title : defaultContent.saudi_manufacturing.title.en),
                ar: next.saudi_manufacturing?.title?.ar ?? defaultContent.saudi_manufacturing.title.ar,
            },
            description: {
                en: next.saudi_manufacturing?.description?.en ?? (typeof next.saudi_manufacturing?.description === "string" ? next.saudi_manufacturing.description : defaultContent.saudi_manufacturing.description.en),
                ar: next.saudi_manufacturing?.description?.ar ?? defaultContent.saudi_manufacturing.description.ar,
            },
            image: next.saudi_manufacturing?.image ?? defaultContent.saudi_manufacturing.image,
            features: mergedFeatures.slice(0, 4),
            cta: {
                text: {
                    en: next.saudi_manufacturing?.cta?.text?.en ?? (typeof next.saudi_manufacturing?.cta?.text === "string" ? next.saudi_manufacturing.cta.text : defaultContent.saudi_manufacturing.cta.text.en),
                    ar: next.saudi_manufacturing?.cta?.text?.ar ?? defaultContent.saudi_manufacturing.cta.text.ar,
                },
                url: next.saudi_manufacturing?.cta?.url ?? defaultContent.saudi_manufacturing.cta.url,
            },
        };

        // Normalize companies
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
    const nextSection = activeIndex < SECTIONS.length - 1 ? SECTIONS[activeIndex + 1] : null;
    const section = content[activeSection.id] || {};

    const setField = (key, value) => {
        setContent((prev) => ({
            ...prev,
            [activeSection.id]: { ...(prev[activeSection.id] || {}), [key]: value },
        }));
    };

    // Hero introductory heading helper
    const handleIntroHeadingChange = (value) => {
        setErrors((prev) => ({ ...prev, introductoryHeading: null }));
        setContent((prev) => ({
            ...prev,
            hero: {
                ...(prev.hero || {}),
                introductory_heading: value,
                introductoryHeading: value,
            },
        }));
    };

    // Our values helpers
    const updateOurValuesTitle = (lang, val) => {
        setContent((prev) => {
            const curr = prev.our_values || {};
            const titleObj = typeof curr.title === "object" ? curr.title : { en: "", ar: "" };
            return {
                ...prev,
                our_values: {
                    ...curr,
                    title: { ...titleObj, [lang]: val },
                },
            };
        });
    };

    const updateCard = (index, field, lang, val) => {
        setContent((prev) => {
            const curr = prev.our_values || {};
            const cards = Array.isArray(curr.cards) ? [...curr.cards] : [];
            const target = cards[index] || { id: index + 1, title: {}, description: {}, icon: "" };
            const fieldObj = typeof target[field] === "object" ? target[field] : { en: "", ar: "" };
            cards[index] = {
                ...target,
                [field]: { ...fieldObj, [lang]: val },
            };
            return {
                ...prev,
                our_values: { ...curr, cards },
            };
        });
    };

    const updateCardIcon = (index, iconValue) => {
        setContent((prev) => {
            const curr = prev.our_values || {};
            const cards = Array.isArray(curr.cards) ? [...curr.cards] : [];
            const target = cards[index] || { id: index + 1, title: {}, description: {}, icon: "" };
            cards[index] = { ...target, icon: iconValue };
            return {
                ...prev,
                our_values: { ...curr, cards },
            };
        });
    };

    // Saudi manufacturing helpers
    const updateSaudiField = (field, lang, val) => {
        setContent((prev) => {
            const curr = prev.saudi_manufacturing || {};
            const obj = typeof curr[field] === "object" ? curr[field] : { en: "", ar: "" };
            return {
                ...prev,
                saudi_manufacturing: {
                    ...curr,
                    [field]: { ...obj, [lang]: val },
                },
            };
        });
    };

    const updateFeature = (index, field, lang, val) => {
        setContent((prev) => {
            const curr = prev.saudi_manufacturing || {};
            const features = Array.isArray(curr.features) ? [...curr.features] : [];
            const target = features[index] || { id: index + 1, title: {}, description: {} };
            const fieldObj = typeof target[field] === "object" ? target[field] : { en: "", ar: "" };
            features[index] = {
                ...target,
                [field]: { ...fieldObj, [lang]: val },
            };
            return {
                ...prev,
                saudi_manufacturing: { ...curr, features },
            };
        });
    };

    const updateSaudiCtaText = (lang, val) => {
        setContent((prev) => {
            const curr = prev.saudi_manufacturing || {};
            const cta = curr.cta || {};
            const textObj = typeof cta.text === "object" ? cta.text : { en: "", ar: "" };
            return {
                ...prev,
                saudi_manufacturing: {
                    ...curr,
                    cta: {
                        ...cta,
                        text: { ...textObj, [lang]: val },
                    },
                },
            };
        });
    };

    const updateSaudiCtaUrl = (val) => {
        setContent((prev) => {
            const curr = prev.saudi_manufacturing || {};
            const cta = curr.cta || {};
            return {
                ...prev,
                saudi_manufacturing: {
                    ...curr,
                    cta: { ...cta, url: val },
                },
            };
        });
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
        if (saving || updateMutation.isPending) return;

        const newErrors = {};

        // TT-16: Required Introductory Heading validation
        const intro = content.hero?.introductory_heading ?? content.hero?.introductoryHeading ?? "";
        const introStr = typeof intro === "object" ? (intro.en || intro.ar || "") : String(intro || "");
        if (!introStr.trim()) {
            newErrors.introductoryHeading = t("errors.page.introductory_heading_required") || "Introductory heading is required";
        }

        // TT-19: Saudi Manufacturing CTA URL validation
        const ctaUrl = content.saudi_manufacturing?.cta?.url;
        if (ctaUrl && !isValidUrlOrPath(ctaUrl)) {
            newErrors.ctaUrl = t("errors.url.invalid") || "Please enter a valid URL or path";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.introductoryHeading) {
                toast.error(newErrors.introductoryHeading);
                setActiveSectionId("hero");
            } else if (newErrors.ctaUrl) {
                toast.error(newErrors.ctaUrl);
                setActiveSectionId("saudi_manufacturing");
            }
            return;
        }

        setSaving(true);
        try {
            await updateMutation.mutateAsync({
                ...page,
                content,
                status: "Published",
            });
            toast.success(t("common.saveSuccess") || "Saved successfully");
            router.push("/dashboard/pages");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || t("common.saveError") || "Error saving page";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
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
                    className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0 d-inline-flex align-items-center"
                    onClick={handleSavePublish}
                    disabled={saving || updateMutation.isPending}
                >
                    {saving || updateMutation.isPending ? (
                        <>
                            <i className="fal fa-spinner-third fa-spin me-2"></i>
                            <span className="txt">{t("common.saving")}</span>
                        </>
                    ) : (
                        <>
                            <i className="fal fa-check me-2"></i>
                            <span className="txt">{t("pages.savePublish")}</span>
                        </>
                    )}
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
                            {/* SECTION 01: HERO */}
                            {activeSection.id === "hero" && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.introductoryHeading")} <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            dir={dir}
                                            type="text"
                                            className={`form-control ${errors.introductoryHeading ? "is-invalid" : ""}`}
                                            placeholder={t("pages.fields.introductoryHeadingPh")}
                                            value={section.introductory_heading ?? section.introductoryHeading ?? ""}
                                            onChange={(e) => handleIntroHeadingChange(e.target.value)}
                                        />
                                        {errors.introductoryHeading && (
                                            <div className="invalid-feedback d-block">{errors.introductoryHeading}</div>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.headline")} <span className="text-danger">*</span>
                                        </label>
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

                            {/* SECTION 02: KEY MESSAGE */}
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

                            {/* SECTION 03: OUR VALUES (TT-18) */}
                            {activeSection.id === "our_values" && (
                                <>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.sectionTitle")} ({t("pages.fields.en")})
                                        </label>
                                        <input
                                            dir="ltr"
                                            type="text"
                                            className="form-control"
                                            value={section.title?.en || ""}
                                            onChange={(e) => updateOurValuesTitle("en", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fsz-12 text-muted">
                                            {t("pages.fields.sectionTitle")} ({t("pages.fields.ar")})
                                        </label>
                                        <input
                                            dir="rtl"
                                            type="text"
                                            className="form-control"
                                            value={section.title?.ar || ""}
                                            onChange={(e) => updateOurValuesTitle("ar", e.target.value)}
                                        />
                                    </div>

                                    {(section.cards || []).slice(0, 4).map((card, idx) => (
                                        <div className="col-12 border rounded p-3 mb-2 bg-light-subtle" key={card.id || idx}>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <h6 className="fsz-13 fw-600 mb-0">
                                                    {t("pages.fields.cardTitle")} #{idx + 1}
                                                </h6>
                                                <span className="badge bg-secondary-subtle text-secondary fsz-11">
                                                    Card {idx + 1} / 4
                                                </span>
                                            </div>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <label className="form-label fsz-11 text-muted">
                                                        {t("pages.fields.cardTitle")} ({t("pages.fields.en")})
                                                    </label>
                                                    <input
                                                        dir="ltr"
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={card.title?.en || ""}
                                                        onChange={(e) => updateCard(idx, "title", "en", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fsz-11 text-muted">
                                                        {t("pages.fields.cardTitle")} ({t("pages.fields.ar")})
                                                    </label>
                                                    <input
                                                        dir="rtl"
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={card.title?.ar || ""}
                                                        onChange={(e) => updateCard(idx, "title", "ar", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fsz-11 text-muted">
                                                        {t("pages.fields.cardDesc")} ({t("pages.fields.en")})
                                                    </label>
                                                    <textarea
                                                        dir="ltr"
                                                        rows={2}
                                                        className="form-control form-control-sm"
                                                        value={card.description?.en || ""}
                                                        onChange={(e) => updateCard(idx, "description", "en", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fsz-11 text-muted">
                                                        {t("pages.fields.cardDesc")} ({t("pages.fields.ar")})
                                                    </label>
                                                    <textarea
                                                        dir="rtl"
                                                        rows={2}
                                                        className="form-control form-control-sm"
                                                        value={card.description?.ar || ""}
                                                        onChange={(e) => updateCard(idx, "description", "ar", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-12 mt-2">
                                                    <label className="form-label fsz-11 text-muted">{t("pages.fields.cardIcon")}</label>
                                                    <FileUpload
                                                        files={filesFromValue(card.icon, "image")}
                                                        onFilesChange={async (uploadedFiles) => {
                                                            if (!uploadedFiles || uploadedFiles.length === 0) {
                                                                updateCardIcon(idx, "");
                                                                return;
                                                            }
                                                            const f = uploadedFiles[0];
                                                            if (f.file) {
                                                                try {
                                                                    const res = await uploadPageMedia("home", f.file, "icon");
                                                                    updateCardIcon(idx, res.path || res.url);
                                                                } catch (err) {
                                                                    toast.error(err?.message || "Failed to upload icon");
                                                                }
                                                            } else if (f.preview) {
                                                                updateCardIcon(idx, f.preview);
                                                            }
                                                        }}
                                                        maxFiles={1}
                                                        accept={IMAGE_ACCEPT}
                                                        title={`${t("pages.fields.cardIcon")} #${idx + 1}`}
                                                        hint={t("pages.videoHint")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* SECTION 04: INDUSTRIES */}
                            {activeSection.id === "industries" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.industriesManaged")}</p>
                                </div>
                            )}

                            {/* SECTION 05: OUR COMPANIES */}
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

                            {/* SECTION 06: SAUDI MANUFACTURING & LOCALISATION (TT-19) */}
                            {activeSection.id === "saudi_manufacturing" && (
                                <div className="col-12 p-0">
                                    <SaudiManufacturingEditor
                                        initialData={content.saudi_manufacturing}
                                        onSave={async (saudiData) => {
                                            const nextContent = {
                                                ...content,
                                                saudi_manufacturing: saudiData,
                                            };
                                            setContent(nextContent);
                                            await updateMutation.mutateAsync({
                                                ...page,
                                                content: nextContent,
                                                status: "Published",
                                            });
                                        }}
                                        isSaving={updateMutation.isPending}
                                    />
                                </div>
                            )}

                            {/* SECTION 07: MEDIA CENTER */}
                            {activeSection.id === "media_center" && (
                                <div className="col-12">
                                    <label className="form-label fsz-12 text-muted">{t("pages.fields.sectionTitle")}</label>
                                    <input dir={dir} type="text" className="form-control" value={section.section_title || ""} onChange={(e) => setField("section_title", e.target.value)} />
                                    <p className="fsz-12 text-muted mt-3 mb-0">{t("pages.postsManaged")}</p>
                                </div>
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
