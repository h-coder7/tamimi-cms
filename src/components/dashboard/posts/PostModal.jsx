"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import FileUpload from "../../shared/FileUpload";
import SimpleRichTextEditor from "../../shared/SimpleRichTextEditor";
import { useCompanies } from "@/hooks/useCompanies";
import { useIndustries } from "@/hooks/useIndustries";
import { POST_CATEGORIES, POST_STATUSES } from "@/hooks/usePosts";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { getLocale } from "@/lib/locale";
import { te } from "@/locales/errors";
import { useI18n } from "@/hooks/useI18n";

const SUMMARY_MAX = 160;
const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

const COVER_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/png": [".png"],
};

const CATEGORY_STATUS = {
    News: "news",
    "Events & Exhibitions": "events_exhibitions",
    Insights: "insights",
    Article: "article",
    Press: "press",
};

const emptyForm = () => ({
    title: { en: "", ar: "" },
    summary: { en: "", ar: "" },
    body: { en: "", ar: "" },
    event_start: "",
    event_end: "",
    venue: "",
    city: "",
    booth: "",
    event_website: "",
    event_kind: "event",
    category: "Events & Exhibitions",
    status: "Draft",
    publish_date: "",
    relatedCompanyId: "",
    industryIds: [],
    company_code: "",
    coverFiles: [],
    coverPath: null,
    seo_title: "",
    seo_description: "",
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function PostModal({ isOpen, onClose, onSave, post }) {
    const { t, isRtl, statusText, text } = useI18n();
    const { data: industries = [] } = useIndustries();
    const {
        data: companies = [],
        refetch: refetchCompanies,
        isFetching: companiesLoading,
        isError: companiesError,
    } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);
    const editorRef = useRef({});
    const publishDateRef = useRef(null);
    const eventStartRef = useRef(null);
    const eventEndRef = useRef(null);

    const categoryOptions = useMemo(
        () =>
            POST_CATEGORIES.map((category) => ({
                value: category,
                label: statusText(CATEGORY_STATUS[category] || category),
            })),
        [statusText]
    );

    const statusOptions = useMemo(
        () => POST_STATUSES.map((status) => ({ value: status, label: statusText(status) })),
        [statusText]
    );

    const companyOptions = useMemo(
        () =>
            buildCompanyFormOptions(companies, { includeNone: true }).map((opt) => {
                if (opt.value === "") return { ...opt, label: t("common.none") };
                if (opt.value === "group" || opt.label === "Tamimi Energy Group") {
                    return { ...opt, label: t("status.group") };
                }
                return opt;
            }),
        [companies, t]
    );

    const isEvent = formData.category === "Events & Exhibitions";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        refetchCompanies().catch(() => {
            toast.error(te("errors.companies.load_failed", getLocale()));
        });
    }, [isOpen, refetchCompanies]);

    useEffect(() => {
        if (!isOpen) return;

        if (post) {
            setFormData({
                title: post.i18nTitle || { en: post.title || "", ar: post.title || "" },
                summary: post.i18nSummary || { en: post.summary || "", ar: post.summary || "" },
                body: post.i18nBody || { en: post.body || "", ar: post.body || "" },
                event_start: post.event_start || "",
                event_end: post.event_end || "",
                venue: post.venue || "",
                city: post.city || "",
                booth: post.booth || "",
                event_website: post.event_website || "",
                event_kind: post.event_kind || "event",
                category: post.category || "News",
                status: post.status || "Draft",
                publish_date: post.publish_date || "",
                relatedCompanyId: post.relatedCompanyId || "",
                industryIds: Array.isArray(post.industryIds) ? post.industryIds : [],
                company_code: post.company_code || "",
                coverFiles: post.cover
                    ? [{ preview: post.cover, type: "image/jpeg", name: t("common.cover") }]
                    : [],
                coverPath: post.coverPath || null,
                seo_title: post.seo_title || "",
                seo_description: post.seo_description || "",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, post, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "seo_title" && value.length > META_TITLE_MAX) return;
        if (name === "seo_description" && value.length > META_DESC_MAX) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Always read latest HTML from the editor DOM (avoids stale React state on quick Save)
        const bodyHtml = {
            en: editorRef.current.en?.getHTML?.() ?? formData.body?.en ?? "",
            ar: editorRef.current.ar?.getHTML?.() ?? formData.body?.ar ?? "",
        };
        const publishDate = publishDateRef.current?.value || formData.publish_date || null;
        const eventStart = eventStartRef.current?.value || formData.event_start || "";
        const eventEnd = eventEndRef.current?.value || formData.event_end || "";
        const plainBody = (value) => value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

        const locale = getLocale();

        const title = { en: String(formData.title?.en || "").trim(), ar: String(formData.title?.ar || "").trim() };
        if (!title.en || !title.ar) {
            toast.error(te("errors.title.required", locale));
            return;
        }

        const summaryEn = String(formData.summary?.en || "").trim();
        const summaryAr = String(formData.summary?.ar || "").trim();
        if (!summaryEn || !summaryAr) {
            toast.error(isRtl ? "الملخص مطلوب باللغتين العربية والإنجليزية." : "Summary is required in English and Arabic.");
            return;
        }
        if (summaryEn.length > SUMMARY_MAX || summaryAr.length > SUMMARY_MAX) {
            toast.error(isRtl ? `يجب ألا يتجاوز كل ملخص ${SUMMARY_MAX} حرفًا.` : `Each summary must be ${SUMMARY_MAX} characters or fewer.`);
            return;
        }

        const hasCover = Boolean(formData.coverPath || formData.coverFiles?.some((file) => file?.file || file?.preview));
        if (formData.status !== "Draft" && !hasCover) {
            toast.error(isRtl ? "صورة الغلاف مطلوبة عند النشر أو الجدولة." : "A cover image is required for published or scheduled posts.");
            return;
        }

        if (!plainBody(bodyHtml.en) || !plainBody(bodyHtml.ar)) {
            toast.error(te("errors.body.required", locale));
            return;
        }

        if (isEvent) {
            if (!eventStart) {
                toast.error(te("errors.event.start_required", locale));
                return;
            }
            if (!formData.venue.trim()) {
                toast.error(te("errors.venue.required", locale));
                return;
            }
            if (
                eventEnd &&
                eventEnd < eventStart
            ) {
                toast.error(te("errors.event.end_before_start", locale));
                return;
            }
        }

        const company = companies.find((c) => c.id === formData.relatedCompanyId);

        onSave({
            title,
            summary: { en: summaryEn, ar: summaryAr },
            body: bodyHtml,
            event_start: isEvent ? (eventStart || null) : null,
            event_end: isEvent ? (eventEnd || null) : null,
            venue: isEvent ? formData.venue.trim() : "",
            city: isEvent ? formData.city.trim() : "",
            booth: isEvent ? formData.booth.trim() : "",
            event_website: isEvent ? formData.event_website.trim() : "",
            event_kind: formData.event_kind || "event",
            category: formData.category,
            status: formData.status,
            publish_date: publishDate,
            relatedCompanyId: formData.relatedCompanyId || null,
            industryIds: Array.isArray(formData.industryIds) ? [...formData.industryIds] : [],
            company_code: company?.code || formData.company_code || "",
            coverFiles: formData.coverFiles,
            coverPath: formData.coverPath,
            cover: formData.coverFiles?.[0]?.preview || "",
            seo_title: formData.seo_title.trim(),
            seo_description: formData.seo_description.trim(),
            is_sample: Boolean(post?.is_sample),
        });
    };

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {post ? t("posts.edit") : t("posts.add")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("posts.content")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    {t("common.title")} <span className="text-danger">*</span>
                                                </label>
                                                <div className="row g-2">{["en", "ar"].map((locale) => <div className="col-md-6" key={locale}><label className="form-text fsz-11" htmlFor={`post-title-${locale}`}>{locale.toUpperCase()}</label><input id={`post-title-${locale}`} type="text" className="form-control" required dir={locale === "ar" ? "rtl" : "ltr"} value={formData.title?.[locale] || ""} onChange={(event) => setFormData((prev) => ({ ...prev, title: { ...(prev.title || {}), [locale]: event.target.value } }))} placeholder={t("posts.titlePh")} /></div>)}</div>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label mb-1">{t("posts.summary")} <span className="text-danger">*</span></label>
                                                <div className="row g-2">
                                                    {["en", "ar"].map((locale) => {
                                                        const value = formData.summary?.[locale] || "";
                                                        return <div className="col-md-6" key={locale}>
                                                            <label className="form-text fsz-11" htmlFor={`post-summary-${locale}`}>{locale.toUpperCase()}</label>
                                                            <div className="d-flex justify-content-end mb-1"><small className={`fsz-11 ${value.length >= SUMMARY_MAX ? "text-danger" : "text-muted"}`} dir="ltr">{value.length}/{SUMMARY_MAX}</small></div>
                                                            <textarea id={`post-summary-${locale}`} className="form-control" rows={3} maxLength={SUMMARY_MAX} required dir={locale === "ar" ? "rtl" : "ltr"} value={value} onChange={(event) => setFormData((prev) => ({ ...prev, summary: { ...(prev.summary || {}), [locale]: event.target.value } }))} placeholder={t("posts.summaryPh")} />
                                                        </div>;
                                                    })}
                                                </div>
                                                <small className="text-muted fsz-11">
                                                    {t("posts.summaryHint", { count: SUMMARY_MAX })}
                                                </small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    {t("posts.body")} <span className="text-danger">*</span>
                                                </label>
                                                <div className="row g-3">{["en", "ar"].map((locale) => <div className="col-12" key={locale}><label className="form-text fsz-11">{locale.toUpperCase()}</label><div dir={locale === "ar" ? "rtl" : "ltr"}><SimpleRichTextEditor ref={(instance) => { editorRef.current[locale] = instance; }} value={formData.body?.[locale] || ""} onChange={(html) => setFormData((prev) => ({ ...prev, body: { ...(prev.body || {}), [locale]: html } }))} placeholder={t("posts.bodyPh")} required /></div></div>)}</div>
                                            </div>
                                        </div>
                                    </Section>

                                    {isEvent && (
                                        <Section title={t("posts.event")}>
                                            <div className="row">
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">
                                                        {t("posts.start")} <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        ref={eventStartRef}
                                                        type="date"
                                                        className="form-control"
                                                        name="event_start"
                                                        required={isEvent}
                                                        dir="ltr"
                                                        value={formData.event_start}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">{t("posts.end")}</label>
                                                    <input
                                                    ref={eventEndRef}
                                                        type="date"
                                                        className="form-control"
                                                        name="event_end"
                                                        min={formData.event_start || undefined}
                                                        dir="ltr"
                                                        value={formData.event_end}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">
                                                        {t("posts.venue")} <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="venue"
                                                        required={isEvent}
                                                        dir={isRtl ? "rtl" : "ltr"}
                                                        value={formData.venue}
                                                        onChange={handleChange}
                                                        placeholder={t("posts.venuePh")}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">{t("common.city")}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="city"
                                                        dir={isRtl ? "rtl" : "ltr"}
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder={t("posts.cityPh")}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">{t("posts.booth")}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="booth"
                                                        dir={isRtl ? "rtl" : "ltr"}
                                                        value={formData.booth}
                                                        onChange={handleChange}
                                                        placeholder={t("common.optional")}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">{t("posts.eventSite")}</label>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="event_website"
                                                        dir="ltr"
                                                        value={formData.event_website}
                                                        onChange={handleChange}
                                                        placeholder="https://"
                                                    />
                                                </div>
                                            </div>
                                        </Section>
                                    )}

                                    <Section title={t("posts.publishing")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("common.category")} <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={categoryOptions}
                                                    value={categoryOptions.find((o) => o.value === formData.category) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            category: opt?.value || "News",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("common.status")}</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find((o) => o.value === formData.status) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            status: opt?.value || "Draft",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("posts.publishDate")}</label>
                                                <input
                                                    ref={publishDateRef}
                                                    type="date"
                                                    className="form-control"
                                                    name="publish_date"
                                                    dir="ltr"
                                                    value={formData.publish_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("posts.relatedIndustries")}</label>
                                                <div className="row">{industries.map((industry) => <div className="col-md-4" key={industry.id}><label className="form-check border rounded p-2 mb-2"><input className="form-check-input" type="checkbox" checked={formData.industryIds.includes(industry.id)} onChange={() => setFormData((prev) => ({ ...prev, industryIds: prev.industryIds.includes(industry.id) ? prev.industryIds.filter((id) => id !== industry.id) : [...prev.industryIds, industry.id] }))} /><span className="form-check-label ms-2">{text(industry.i18nTitle, industry.title || industry.slug)}</span></label></div>)}</div>
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("posts.relatedCompany")}</label>
                                                <Select
                                                    options={companyOptions}
                                                    value={
                                                        companyOptions.find((o) => o.value === formData.relatedCompanyId)
                                                        || companyOptions[0]
                                                    }
                                                    onChange={(opt) => {
                                                        const value = opt?.value || "";
                                                        const company = companies.find((c) => c.id === value);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            relatedCompanyId: value,
                                                            company_code: company?.code || "",
                                                        }));
                                                    }}
                                                    isLoading={companiesLoading}
                                                    classNamePrefix="react-select"
                                                    placeholder={
                                                        companiesError
                                                            ? t("posts.companiesFailed")
                                                            : companiesLoading
                                                              ? t("posts.companiesLoading")
                                                              : t("common.none")
                                                    }
                                                    noOptionsMessage={() =>
                                                        companiesLoading
                                                            ? t("common.loading")
                                                            : t("posts.noCompanies")
                                                    }
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                                {!companiesLoading && companies.length === 0 && (
                                                    <small className="text-danger fsz-11 d-block mt-1">
                                                        {t("posts.noCompaniesLoaded")}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("posts.cover")} {formData.status !== "Draft" && <span className="text-danger">*</span>}</label>
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, coverFiles: files }))
                                                    }
                                                    accept={COVER_ACCEPT}
                                                    maxFiles={1}
                                                    title={t("posts.uploadCover")}
                                                    hint={t("posts.coverHint")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("posts.seo")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">{t("posts.metaTitle")}</label>
                                                    <small className={`fsz-11 ${formData.seo_title.length >= META_TITLE_MAX ? "text-danger" : "text-muted"}`}>
                                                        {t("posts.characters", { count: formData.seo_title.length, max: META_TITLE_MAX })}
                                                    </small>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="seo_title"
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.seo_title}
                                                    onChange={handleChange}
                                                    placeholder={t("posts.metaTitle")}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">{t("posts.metaDescription")}</label>
                                                    <small className={`fsz-11 ${formData.seo_description.length >= META_DESC_MAX ? "text-danger" : "text-muted"}`}>
                                                        {t("posts.characters", { count: formData.seo_description.length, max: META_DESC_MAX })}
                                                    </small>
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    name="seo_description"
                                                    rows={3}
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.seo_description}
                                                    onChange={handleChange}
                                                    placeholder={t("posts.metaDescription")}
                                                />
                                            </div>
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    {t("common.cancel")}
                                </button>
                                <button type="submit" className="butn-st2">
                                    {post ? t("posts.update") : t("posts.add")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
