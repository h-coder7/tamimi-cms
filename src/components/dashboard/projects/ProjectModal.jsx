"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { buildIndustryFormOptions } from "@/lib/industryOptions";
import { useIndustries, VALUE_CHAIN_STAGES } from "@/hooks/useIndustries";
import { useI18n } from "@/hooks/useI18n";

const SUMMARY_MAX = 200;

const GALLERY_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/png": [".png"],
    "video/mp4": [".mp4"],
};

const COVER_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/png": [".png"],
};

const emptyForm = () => ({
    title: "",
    client: "",
    location: "",
    summary: "",
    challenge: "",
    solution: "",
    result: "",
    services: [],
    gallery: [],
    companyId: "",
    company_code: "",
    industryId: "",
    industry: "",
    year: String(new Date().getFullYear()),
    value_chain: [],
    status: "Draft",
    featured: false,
    coverFiles: [],
    coverPath: null,
    is_sample: false,
    content_label: "",
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function ProjectModal({ isOpen, onClose, onSave, project }) {
    const { t, isRtl, statusText, text } = useI18n();
    const textDir = isRtl ? "rtl" : "ltr";
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const { data: industries = [], refetch: refetchIndustries } = useIndustries();
    const [formData, setFormData] = useState(emptyForm);
    const [serviceInput, setServiceInput] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: statusText("Draft") },
            { value: "Published", label: statusText("Published") },
        ],
        [statusText]
    );

    const companyOptions = useMemo(
        () => buildCompanyFormOptions(companies).map((opt) => {
            const company = companies.find((item) => item.id === opt.value);
            if (!company) return opt;
            const name = text(company.i18nTitle, company.title);
            return {
                ...opt,
                label: company.code ? `${company.code} — ${name}`.trim() : name,
            };
        }),
        [companies, text]
    );

    const industryOptions = useMemo(
        () => buildIndustryFormOptions(industries).map((opt) => {
            const industry = industries.find((item) => item.id === opt.value);
            return {
                ...opt,
                label: industry ? text(industry.i18nTitle, opt.label) : opt.label,
            };
        }),
        [industries, text]
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        refetchCompanies();
        refetchIndustries();
    }, [isOpen, refetchCompanies, refetchIndustries]);

    useEffect(() => {
        if (!isOpen) return;

        if (project) {
            const galleryItems = Array.isArray(project.galleryItems)
                ? project.galleryItems
                : [];
            setFormData({
                title: project.title || "",
                client: project.client || "",
                location: project.location || "",
                summary: project.summary || "",
                challenge: project.challenge || "",
                solution: project.solution || "",
                result: project.result || "",
                services: Array.isArray(project.services) ? project.services : [],
                gallery: galleryItems.length
                    ? galleryItems.map((item, idx) => ({
                        preview: item.url || item.videoUrl || "",
                        path: item.path || null,
                        videoUrl: item.videoUrl || null,
                        name: t("companies.galleryItem", { n: idx + 1 }),
                        type: item.videoUrl || String(item.url || "").includes(".mp4")
                            ? "video/mp4"
                            : "image/jpeg",
                    }))
                    : Array.isArray(project.gallery)
                        ? project.gallery.map((item, idx) => (
                            typeof item === "string"
                                ? { preview: item, name: t("companies.galleryItem", { n: idx + 1 }), type: "image/jpeg" }
                                : item
                        ))
                        : [],
                companyId: project.companyId || "",
                company_code: project.company_code || "",
                industryId: project.industryId || "",
                industry: project.industry || "",
                year: project.year ? String(project.year) : String(new Date().getFullYear()),
                value_chain: Array.isArray(project.value_chain) ? project.value_chain : [],
                status: project.status || "Draft",
                featured: Boolean(project.featured),
                coverFiles: project.cover
                    ? [{ preview: project.cover, type: "image/jpeg", name: t("common.cover") }]
                    : [],
                coverPath: project.coverPath || null,
                is_sample: Boolean(project.is_sample),
                content_label: project.content_label || "",
            });
        } else {
            setFormData(emptyForm());
        }

        setServiceInput("");
    }, [isOpen, project, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "summary" && value.length > SUMMARY_MAX) return;
        if (name === "year" && value && !/^\d{0,4}$/.test(value)) return;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const toggleValueChain = (stage) => {
        setFormData((prev) => {
            const exists = prev.value_chain.includes(stage);
            return {
                ...prev,
                value_chain: exists
                    ? prev.value_chain.filter((item) => item !== stage)
                    : [...prev.value_chain, stage],
            };
        });
    };

    const addService = () => {
        const value = serviceInput.trim();
        if (!value) return;
        if (formData.services.includes(value)) {
            setServiceInput("");
            return;
        }
        setFormData((prev) => ({ ...prev, services: [...prev.services, value] }));
        setServiceInput("");
    };

    const removeService = (index) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const company = companies.find((c) => c.id === formData.companyId);
        const industry = industries.find((i) => i.id === formData.industryId);

        onSave({
            title: formData.title.trim(),
            client: formData.client.trim(),
            location: formData.location.trim(),
            summary: formData.summary.trim(),
            challenge: formData.challenge.trim(),
            solution: formData.solution.trim(),
            result: formData.result.trim(),
            services: formData.services,
            gallery: formData.gallery,
            companyId: formData.companyId,
            company_code: company?.code || formData.company_code || "",
            industryId: formData.industryId,
            industry: industry?.title || formData.industry || "",
            year: formData.year === "" ? null : Number(formData.year),
            value_chain: formData.value_chain,
            status: formData.status,
            featured: Boolean(formData.featured),
            coverFiles: formData.coverFiles,
            coverPath: formData.coverPath,
            cover: formData.coverFiles?.[0]?.preview || "",
            is_sample: Boolean(formData.is_sample),
            content_label: formData.content_label.trim(),
        });
    };

    if (!isOpen || !isMounted) return null;

    const summaryCount = formData.summary.length;

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
                                {project ? t("projects.edit") : t("projects.addTitle")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("projects.details")}>
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">
                                                    {t("projects.name")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={textDir}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.namePh")}
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    {t("common.client")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="client"
                                                    required
                                                    dir={textDir}
                                                    value={formData.client}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.clientPh")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("common.location")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="location"
                                                    dir={textDir}
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.locationPh")}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">{t("common.summary")}</label>
                                                    <small className={`fsz-11 ${summaryCount >= SUMMARY_MAX ? "text-danger" : "text-muted"}`}>
                                                        {summaryCount}/{SUMMARY_MAX}
                                                    </small>
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    name="summary"
                                                    rows={3}
                                                    dir={textDir}
                                                    value={formData.summary}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.summaryPh")}
                                                />
                                                <small className="text-muted fsz-11">
                                                    {t("projects.summaryHint", { max: SUMMARY_MAX })}
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("projects.caseStudy")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("projects.challenge")}</label>
                                                <textarea
                                                    className="form-control"
                                                    name="challenge"
                                                    rows={3}
                                                    dir={textDir}
                                                    value={formData.challenge}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.challengePh")}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("projects.solution")}</label>
                                                <textarea
                                                    className="form-control"
                                                    name="solution"
                                                    rows={3}
                                                    dir={textDir}
                                                    value={formData.solution}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.solutionPh")}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("projects.result")}</label>
                                                <textarea
                                                    className="form-control"
                                                    name="result"
                                                    rows={3}
                                                    dir={textDir}
                                                    value={formData.result}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.resultPh")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        title={t("projects.scope")}
                                        hint={t("projects.servicesHint")}
                                    >
                                        {formData.services.length === 0 ? (
                                            <div className="text-muted fsz-12 mb-2">{t("projects.noServices")}</div>
                                        ) : (
                                            <ol className="mb-3 ps-3">
                                                {formData.services.map((service, index) => (
                                                    <li key={`${service}-${index}`} className="mb-2">
                                                        <div className="d-flex align-items-center justify-content-between gap-2">
                                                            <span className="fsz-13">{service}</span>
                                                            <button
                                                                type="button"
                                                                className="btn p-0 border-0 text-muted"
                                                                onClick={() => removeService(index)}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={serviceInput}
                                                onChange={(e) => setServiceInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addService();
                                                    }
                                                }}
                                                placeholder={t("projects.servicePh")}
                                                dir={textDir}
                                            />
                                            <button type="button" className="butn-st2 butn-md" onClick={addService}>
                                                {t("projects.addService")}
                                            </button>
                                        </div>
                                    </Section>

                                    <Section
                                        title={t("projects.gallery")}
                                        hint={t("projects.galleryHint")}
                                    >
                                        <FileUpload
                                            files={formData.gallery}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, gallery: files }))}
                                            accept={GALLERY_ACCEPT}
                                            maxFiles={12}
                                            title={t("projects.drop")}
                                            hint={t("projects.galleryHint")}
                                        />
                                    </Section>

                                    <Section title={t("projects.links")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("projects.deliveredBy")} <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={companyOptions}
                                                    value={companyOptions.find((o) => o.value === formData.companyId) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            companyId: opt?.value || "",
                                                            company_code:
                                                                companies.find((c) => c.id === opt?.value)?.code || "",
                                                        }))
                                                    }
                                                    required
                                                    classNamePrefix="react-select"
                                                    isRtl={isRtl}
                                                    placeholder={t("projects.selectCompany")}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("common.industry")} <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={industryOptions}
                                                    value={industryOptions.find((o) => o.value === formData.industryId) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            industryId: opt?.value || "",
                                                            industry:
                                                                industries.find((i) => i.id === opt?.value)?.title || "",
                                                        }))
                                                    }
                                                    required
                                                    classNamePrefix="react-select"
                                                    isRtl={isRtl}
                                                    placeholder={t("projects.selectIndustry")}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">{t("common.year")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="year"
                                                    dir="ltr"
                                                    value={formData.year}
                                                    onChange={handleChange}
                                                    placeholder={t("projects.yearPh")}
                                                    inputMode="numeric"
                                                />
                                                <small className="text-muted fsz-11">{t("projects.yearHint")}</small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label d-block mb-2">{t("projects.valueChain")}</label>
                                                <div className="d-flex flex-column gap-2">
                                                    {VALUE_CHAIN_STAGES.map((stage) => (
                                                        <div className="form-check" key={stage}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`project-stage-${stage}`}
                                                                checked={formData.value_chain.includes(stage)}
                                                                onChange={() => toggleValueChain(stage)}
                                                            />
                                                            <label className="form-check-label fsz-13" htmlFor={`project-stage-${stage}`}>
                                                                {t(`valueChain.${stage}`)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <small className="text-muted fsz-11 d-block mt-2">
                                                    {t("projects.valueChainHint")}
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("projects.publishing")}>
                                        <div className="row">
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">{t("common.status")}</label>
                                                <Select
                                                    options={statusOptions}
                                                    isRtl={isRtl}
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
                                            <div className="col-lg-8 mb-3 d-flex align-items-end">
                                                <div className="form-check mb-2">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="project-featured"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label fsz-13" htmlFor="project-featured">
                                                        {t("projects.featuredHome")}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("projects.cover")}</label>
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, coverFiles: files }))}
                                                    accept={COVER_ACCEPT}
                                                    maxFiles={1}
                                                    title={t("projects.uploadCover")}
                                                    hint={t("projects.coverHint")}
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
                                <button
                                    type="submit"
                                    className="butn-st2"
                                    // disabled={!formData.companyId || !formData.industryId}
                                >
                                    {project ? t("projects.update") : t("projects.add")}
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
