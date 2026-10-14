"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import FileUpload from "../../shared/FileUpload";
import SimpleRichTextEditor from "../../shared/SimpleRichTextEditor";
import { useCompanies } from "@/hooks/useCompanies";
import { POST_CATEGORIES, POST_STATUSES } from "@/hooks/usePosts";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { getLocale } from "@/lib/locale";
import { te } from "@/locales/errors";

const SUMMARY_MAX = 200;
const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

const COVER_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/png": [".png"],
};

const emptyForm = () => ({
    title: "",
    summary: "",
    body: "",
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
    const {
        data: companies = [],
        refetch: refetchCompanies,
        isFetching: companiesLoading,
        isError: companiesError,
    } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);
    const editorRef = useRef(null);

    const categoryOptions = useMemo(
        () => POST_CATEGORIES.map((category) => ({ value: category, label: category })),
        []
    );

    const statusOptions = useMemo(
        () => POST_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    const companyOptions = useMemo(
        () => buildCompanyFormOptions(companies, { includeNone: true }),
        [companies]
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
                title: post.title || "",
                summary: post.summary || "",
                body: post.body || "",
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
                company_code: post.company_code || "",
                coverFiles: post.cover
                    ? [{ preview: post.cover, type: "image/jpeg", name: "Cover" }]
                    : [],
                coverPath: post.coverPath || null,
                seo_title: post.seo_title || "",
                seo_description: post.seo_description || "",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, post]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "summary" && value.length > SUMMARY_MAX) return;
        if (name === "seo_title" && value.length > META_TITLE_MAX) return;
        if (name === "seo_description" && value.length > META_DESC_MAX) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Always read latest HTML from the editor DOM (avoids stale React state on quick Save)
        const bodyHtml = editorRef.current?.getHTML?.() ?? formData.body ?? "";
        const plainBody = bodyHtml.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

        const locale = getLocale();

        if (!formData.title.trim()) {
            toast.error(te("errors.title.required", locale));
            return;
        }

        if (!plainBody) {
            toast.error(te("errors.body.required", locale));
            return;
        }

        if (isEvent) {
            if (!formData.event_start) {
                toast.error(te("errors.event.start_required", locale));
                return;
            }
            if (!formData.venue.trim()) {
                toast.error(te("errors.venue.required", locale));
                return;
            }
            if (
                formData.event_end &&
                formData.event_end < formData.event_start
            ) {
                toast.error(te("errors.event.end_before_start", locale));
                return;
            }
        }

        const company = companies.find((c) => c.id === formData.relatedCompanyId);

        onSave({
            title: formData.title.trim(),
            summary: formData.summary.trim(),
            body: bodyHtml,
            event_start: isEvent ? (formData.event_start || null) : null,
            event_end: isEvent ? (formData.event_end || null) : null,
            venue: isEvent ? formData.venue.trim() : "",
            city: isEvent ? formData.city.trim() : "",
            booth: isEvent ? formData.booth.trim() : "",
            event_website: isEvent ? formData.event_website.trim() : "",
            event_kind: formData.event_kind || "event",
            category: formData.category,
            status: formData.status,
            publish_date: formData.publish_date || null,
            relatedCompanyId: formData.relatedCompanyId || null,
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
                                {post ? "Edit Post" : "Add Post"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title="Content">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    Title <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Post title"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">Summary</label>
                                                    <small className={`fsz-11 ${formData.summary.length >= SUMMARY_MAX ? "text-danger" : "text-muted"}`}>
                                                        {formData.summary.length}/{SUMMARY_MAX}
                                                    </small>
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    name="summary"
                                                    rows={3}
                                                    value={formData.summary}
                                                    onChange={handleChange}
                                                    placeholder="Short summary for cards"
                                                />
                                                <small className="text-muted fsz-11">
                                                    Shown on cards · max {SUMMARY_MAX} characters
                                                </small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    Body <span className="text-danger">*</span>
                                                </label>
                                                <SimpleRichTextEditor
                                                    ref={editorRef}
                                                    value={formData.body}
                                                    onChange={(html) =>
                                                        setFormData((prev) => ({ ...prev, body: html }))
                                                    }
                                                    placeholder="Write the article…"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {isEvent && (
                                        <Section title="Event details">
                                            <div className="row">
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">
                                                        Start date <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="event_start"
                                                        required={isEvent}
                                                        value={formData.event_start}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">End date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="event_end"
                                                        min={formData.event_start || undefined}
                                                        value={formData.event_end}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">
                                                        Venue <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="venue"
                                                        required={isEvent}
                                                        value={formData.venue}
                                                        onChange={handleChange}
                                                        placeholder="Venue name"
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">Booth / stand</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="booth"
                                                        value={formData.booth}
                                                        onChange={handleChange}
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label">Event website</label>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="event_website"
                                                        value={formData.event_website}
                                                        onChange={handleChange}
                                                        placeholder="https://"
                                                    />
                                                </div>
                                            </div>
                                        </Section>
                                    )}

                                    <Section title="Publishing">
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Category <span className="text-danger">*</span>
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
                                                <label className="form-label">Status</label>
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
                                                <label className="form-label">Publish date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="publish_date"
                                                    value={formData.publish_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Related company</label>
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
                                                            ? "Failed to load companies"
                                                            : companiesLoading
                                                              ? "Loading companies…"
                                                              : "None"
                                                    }
                                                    noOptionsMessage={() =>
                                                        companiesLoading
                                                            ? "Loading…"
                                                            : "No companies found"
                                                    }
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                                {!companiesLoading && companies.length === 0 && (
                                                    <small className="text-danger fsz-11 d-block mt-1">
                                                        No companies loaded. Check Companies module / API.
                                                    </small>
                                                )}
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Cover image</label>
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, coverFiles: files }))
                                                    }
                                                    accept={COVER_ACCEPT}
                                                    maxFiles={1}
                                                    title="Upload cover"
                                                    hint="JPG / WEBP · 1600×900 recommended"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="SEO">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">Meta title</label>
                                                    <small className={`fsz-11 ${formData.seo_title.length >= META_TITLE_MAX ? "text-danger" : "text-muted"}`}>
                                                        {formData.seo_title.length} / {META_TITLE_MAX} characters
                                                    </small>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="seo_title"
                                                    value={formData.seo_title}
                                                    onChange={handleChange}
                                                    placeholder="Meta title"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">Meta description</label>
                                                    <small className={`fsz-11 ${formData.seo_description.length >= META_DESC_MAX ? "text-danger" : "text-muted"}`}>
                                                        {formData.seo_description.length} / {META_DESC_MAX} characters
                                                    </small>
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    name="seo_description"
                                                    rows={3}
                                                    value={formData.seo_description}
                                                    onChange={handleChange}
                                                    placeholder="Meta description"
                                                />
                                            </div>
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="butn-st2">
                                    {post ? "Update Post" : "Add Post"}
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
