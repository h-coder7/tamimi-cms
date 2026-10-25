"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCertificates } from "@/hooks/useCertificates";
import { useIndustries } from "@/hooks/useIndustries";
import { useI18n } from "@/hooks/useI18n";

const LOGO_ACCEPT = {
    "image/svg+xml": [".svg"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
};

const COVER_ACCEPT = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
};

const GALLERY_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
};

const PDF_ACCEPT = {
    "application/pdf": [".pdf"],
};

const COMPANY_NAME_MAX = 100;
const COMPANY_SHORT_CODE_MAX = 12;

const VALUE_CHAIN_OPTIONS = [
    "Engineering & Design",
    "Manufacturing & Fabrication",
    "Supply & Distribution",
    "Installation & Commissioning",
    "Operations & Maintenance",
];

const emptyForm = () => ({
    title: "",
    code: "",
    tagline: "",
    year_established: "",
    overview: "",
    services: [],
    products: [],
    industries: [],
    value_chain: [],
    certifications: [],
    gallery: [],
    video_url: "",
    status: "Draft",
    type: "Subsidiary",
    display_order: "",
    logoFiles: [],
    coverFiles: [],
    phone: "",
    email: "",
    website: "",
    brochureFiles: [],
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

export default function CompanyModal({ isOpen, onClose, onSave, company }) {
    const { t, isRtl, statusText, text } = useI18n();
    const textDir = isRtl ? "rtl" : "ltr";
    const {
        data: industryOptions = [],
        isLoading: industriesLoading,
        isError: industriesError,
        refetch: refetchIndustries,
    } = useIndustries();
    const {
        data: certificateRows = [],
        isLoading: certificatesLoading,
        isError: certificatesError,
        isSuccess: certificatesReady,
        refetch: refetchCertificates,
    } = useCertificates();
    const [formData, setFormData] = useState(emptyForm);
    const [serviceInput, setServiceInput] = useState("");
    const [productInput, setProductInput] = useState("");
    const [dragServiceIndex, setDragServiceIndex] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Always load the latest industries list when opening the company form
    useEffect(() => {
        if (isOpen) {
            void refetchIndustries();
            void refetchCertificates();
        }
    }, [isOpen, refetchIndustries, refetchCertificates]);

    useEffect(() => {
        if (!isOpen) return;

        if (company) {
            setFormData({
                title: company.title || "",
                code: company.code || "",
                tagline: company.tagline || "",
                year_established:
                    company.year_established != null
                        ? String(company.year_established)
                        : "",
                overview: company.overview || company.field || company.description || "",
                services: Array.isArray(company.services)
                    ? company.services
                          .map((s) => (typeof s === "string" ? s : s?.en || s?.ar || ""))
                          .filter(Boolean)
                    : [],
                products: Array.isArray(company.products)
                    ? company.products
                          .map((p) => (typeof p === "string" ? p : p?.en || p?.ar || ""))
                          .filter(Boolean)
                    : [],
                industries: Array.isArray(company.industryIds)
                    ? company.industryIds
                    : [],
                value_chain: Array.isArray(company.value_chain) ? company.value_chain : [],
                certifications: Array.isArray(company.certifications) ? company.certifications : [],
                gallery: Array.isArray(company.galleryItems) && company.galleryItems.length
                    ? company.galleryItems.map((item, idx) => ({
                        preview: item.url || item.videoUrl || "",
                        path: item.path || null,
                        name: t("companies.galleryItem", { n: idx + 1 }),
                        type: String(item.url || item.path || "").toLowerCase().includes(".mp4")
                            ? "video/mp4"
                            : "image/jpeg",
                    }))
                    : Array.isArray(company.gallery)
                        ? company.gallery.map((item, idx) => (
                            typeof item === "string"
                                ? { preview: item, name: t("companies.galleryItem", { n: idx + 1 }), type: "image/jpeg" }
                                : item
                        ))
                        : [],
                video_url: company.video_url || "",
                status: company.status || "Draft",
                type: company.type || "Subsidiary",
                display_order: company.display_order ?? "",
                logoFiles: company.image
                    ? [{ preview: company.image, type: "image/png", name: t("common.logo") }]
                    : [],
                coverFiles: company.cover
                    ? [{ preview: company.cover, type: "image/jpeg", name: t("common.cover") }]
                    : [],
                phone: company.phone || "",
                email: company.email || "",
                website: company.website || company.domain || "",
                brochureFiles: company.brochure
                    ? [{ preview: company.brochure, type: "application/pdf", name: `${t("status.brochure")}.pdf` }]
                    : [],
                seo_title: company.seo_title || "",
                seo_description: company.seo_description || "",
            });
        } else {
            setFormData(emptyForm());
        }

        setServiceInput("");
        setProductInput("");
        setDragServiceIndex(null);
    }, [company, isOpen, t]);

    const typeOptions = useMemo(() => [
        { value: "Subsidiary", label: statusText("Subsidiary") },
        { value: "Joint Venture", label: statusText("Joint Venture") },
    ], [statusText]);

    const statusOptions = useMemo(() => [
        { value: "Draft", label: statusText("Draft") },
        { value: "Published", label: statusText("Published") },
    ], [statusText]);

    const certificationOptions = useMemo(() => certificateRows.map((cert) => ({
        id: cert.id,
        label: text(cert.i18nTitle, cert.title),
        tag: [cert.type, cert.issuing_body].filter(Boolean).join(" · "),
        draft: cert.publish_status === "Draft",
    })), [certificateRows, text]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleListValue = (key, value) => {
        setFormData((prev) => {
            const current = prev[key] || [];
            const exists = current.includes(value);
            return {
                ...prev,
                [key]: exists ? current.filter((item) => item !== value) : [...current, value],
            };
        });
    };

    const addService = () => {
        const value = serviceInput.trim();
        if (!value) return;
        if (formData.services.length >= 12) return;
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

    const onServiceDragStart = (index) => setDragServiceIndex(index);

    const onServiceDrop = (index) => {
        if (dragServiceIndex === null || dragServiceIndex === index) return;
        setFormData((prev) => {
            const next = [...prev.services];
            const [moved] = next.splice(dragServiceIndex, 1);
            next.splice(index, 0, moved);
            return { ...prev, services: next };
        });
        setDragServiceIndex(null);
    };

    const addProduct = () => {
        const value = productInput.trim();
        if (!value) return;
        if (formData.products.length >= 6) return;
        if (formData.products.includes(value)) {
            setProductInput("");
            return;
        }
        setFormData((prev) => ({ ...prev, products: [...prev.products, value] }));
        setProductInput("");
    };

    const removeProduct = (index) => {
        setFormData((prev) => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const website = formData.website.trim();
        const pendingWebsite = website.toLowerCase().includes("pending");
        const industries = formData.industries;

        const submissionData = {
            title: formData.title.trim(),
            code: formData.code.trim(),
            tagline: formData.tagline.trim(),
            year_established: String(formData.year_established ?? "").trim(),
            overview: formData.overview.trim(),
            field: formData.overview.trim(),
            description: formData.overview.trim(),
            services: formData.services,
            products: formData.products,
            industryIds: industries,
            industries: industryOptions
                .filter((i) => industries.includes(i.id))
                .map((i) => i.title),
            industries_count: industries.length,
            industries_label: `${industries.length} industries · draft`,
            value_chain: formData.value_chain,
            certifications: certificatesReady
                ? formData.certifications.filter((id) => certificationOptions.some((cert) => cert.id === id))
                : formData.certifications,
            gallery: formData.gallery,
            video_url: formData.video_url.trim(),
            status: formData.status,
            type: formData.type,
            display_order: formData.display_order === "" ? null : Number(formData.display_order),
            image: formData.logoFiles?.[0]?.preview || company?.image || "",
            cover: formData.coverFiles?.[0]?.preview || company?.cover || "",
            logoFiles: formData.logoFiles,
            coverFiles: formData.coverFiles,
            brochureFiles: formData.brochureFiles,
            logoPath: company?.logoPath || null,
            coverPath: company?.coverPath || null,
            brochurePath: company?.brochurePath || null,
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            website,
            domain: pendingWebsite || !website
                ? ""
                : (website.startsWith("http") ? website : `https://${website}`),
            brochure: formData.brochureFiles?.[0]?.preview || company?.brochure || "",
            seo_title: formData.seo_title.trim(),
            seo_description: formData.seo_description.trim(),
            address: company?.address || "",
            location: company?.location || "",
        };

        onSave(submissionData);
    };

    if (!isOpen || !isMounted) return null;

    const overviewCount = formData.overview.length;
    const seoTitleCount = formData.seo_title.length;
    const seoDescCount = formData.seo_description.length;
    const nameCount = formData.title.length;
    const codeCount = formData.code.length;

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
                                {company ? t("companies.edit") : t("companies.addTitle")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    {/* Basic information */}
                                    <Section title={t("companies.basic")}>
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">{t("companies.name")} <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={textDir}
                                                    maxLength={COMPANY_NAME_MAX}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.namePh")}
                                                />
                                                <small className="text-muted fsz-11">
                                                    {t("companies.charCount", { count: nameCount, max: COMPANY_NAME_MAX })}
                                                </small>
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">{t("companies.shortCode")} <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="code"
                                                    required
                                                    dir="ltr"
                                                    maxLength={COMPANY_SHORT_CODE_MAX}
                                                    value={formData.code}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.shortCodePh")}
                                                />
                                                <small className="text-muted fsz-11">
                                                    {t("companies.charCount", { count: codeCount, max: COMPANY_SHORT_CODE_MAX })}
                                                </small>
                                            </div>
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">{t("companies.tagline")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="tagline"
                                                    dir={textDir}
                                                    value={formData.tagline}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.taglinePh")}
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">{t("companies.year")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="year_established"
                                                    dir="ltr"
                                                    value={formData.year_established}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.yearPh")}
                                                    maxLength={4}
                                                    pattern="[0-9]{4}"
                                                />
                                                <small className="text-muted fsz-11">{t("companies.yearPh")}</small>
                                            </div>
                                            <div className="col-12 mb-1">
                                                <label className="form-label">{t("common.overview")} <span className="text-danger">*</span></label>
                                                <textarea
                                                    className="form-control"
                                                    name="overview"
                                                    rows="4"
                                                    required
                                                    dir={textDir}
                                                    maxLength={600}
                                                    value={formData.overview}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.overviewPh")}
                                                />
                                                <small className="text-muted fsz-11">
                                                    {t("companies.overviewHint", { count: overviewCount })}
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Services & products */}
                                    <Section
                                        title={t("companies.servicesProducts")}
                                        hint={t("companies.servicesHint")}
                                    >
                                        <div className="mb-3">
                                            <label className="form-label">{t("companies.services")}</label>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {formData.services.map((service, index) => (
                                                    <span
                                                        key={`${service}-${index}`}
                                                        className="badge bg-light text-dark border fsz-12 d-inline-flex align-items-center gap-2 py-2 px-3"
                                                        draggable
                                                        onDragStart={() => onServiceDragStart(index)}
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={() => onServiceDrop(index)}
                                                        style={{ cursor: "grab" }}
                                                        title={t("companies.dragReorder")}
                                                    >
                                                        <i className="fal fa-grip-lines-vertical text-muted"></i>
                                                        {service}
                                                        <button
                                                            type="button"
                                                            className="btn p-0 border-0 text-muted"
                                                            onClick={() => removeService(index)}
                                                            aria-label={t("companies.removeService", { name: service })}
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
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
                                                    placeholder={t("companies.addService")}
                                                    dir={textDir}
                                                    disabled={formData.services.length >= 12}
                                                />
                                                <button
                                                    type="button"
                                                    className="butn-st2 butn-md"
                                                    onClick={addService}
                                                    disabled={formData.services.length >= 12}
                                                >
                                                    {t("common.add")}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label">{t("companies.products")}</label>
                                            {formData.products.length === 0 ? (
                                                <div className="text-muted fsz-12 mb-2">{t("companies.noProducts")}</div>
                                            ) : (
                                                <div className="d-flex flex-wrap gap-2 mb-2">
                                                    {formData.products.map((product, index) => (
                                                        <span key={`${product}-${index}`} className="badge bg-light text-dark border fsz-12 py-2 px-3">
                                                            {product}
                                                            <button
                                                                type="button"
                                                                className="btn p-0 border-0 text-muted ms-2"
                                                                onClick={() => removeProduct(index)}
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={productInput}
                                                    onChange={(e) => setProductInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addProduct();
                                                        }
                                                    }}
                                                    placeholder={t("companies.addProduct")}
                                                    dir={textDir}
                                                    disabled={formData.products.length >= 6}
                                                />
                                                <button
                                                    type="button"
                                                    className="butn-st2 butn-md"
                                                    onClick={addProduct}
                                                    disabled={formData.products.length >= 6}
                                                >
                                                    {t("common.add")}
                                                </button>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Industries We Power */}
                                    <Section
                                        title={t("industries.title")}
                                        hint={t("companies.industriesHint")}
                                    >
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label d-block mb-2">{t("companies.industriesServed")}</label>
                                                <div className="d-flex flex-column gap-2">
                                                    {industriesLoading && (
                                                        <p className="fsz-12 text-muted mb-0">{t("industries.loading")}</p>
                                                    )}
                                                    {industriesError && (
                                                        <p className="fsz-12 text-danger mb-0">
                                                            {t("industries.couldNotLoad")}{" "}
                                                            <button
                                                                type="button"
                                                                className="btn btn-link btn-sm p-0 align-baseline"
                                                                onClick={() => refetchIndustries()}
                                                            >
                                                                {t("industries.retry")}
                                                            </button>
                                                        </p>
                                                    )}
                                                    {!industriesLoading &&
                                                        !industriesError &&
                                                        industryOptions.length === 0 && (
                                                        <p className="fsz-12 text-muted mb-0">
                                                            {t("industries.noneYet")}
                                                        </p>
                                                    )}
                                                    {industryOptions.map((industry) => (
                                                        <div className="form-check" key={industry.id}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`industry-${industry.id}`}
                                                                checked={formData.industries.includes(industry.id)}
                                                                onChange={() => toggleListValue("industries", industry.id)}
                                                            />
                                                            <label className="form-check-label fsz-13" htmlFor={`industry-${industry.id}`}>
                                                                {text(industry.i18nTitle, industry.title)}
                                                                {industry.status === "Draft" && (
                                                                    <span className="text-muted fsz-11 ms-1">({statusText("Draft")})</span>
                                                                )}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label d-block mb-2">{t("companies.valueChain")}</label>
                                                <div className="d-flex flex-column gap-2">
                                                    {VALUE_CHAIN_OPTIONS.map((stage) => (
                                                        <div className="form-check" key={stage}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`value-chain-${stage}`}
                                                                checked={formData.value_chain.includes(stage)}
                                                                onChange={() => toggleListValue("value_chain", stage)}
                                                            />
                                                            <label className="form-check-label fsz-13" htmlFor={`value-chain-${stage}`}>
                                                                {t(`valueChain.${stage}`)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Certifications */}
                                    <Section
                                        title={t("companies.certifications")}
                                        hint={t("companies.certsHint")}
                                    >
                                        <div className="d-flex flex-column gap-2">
                                            {certificatesLoading && (
                                                <p className="fsz-12 text-muted mb-0">{t("certificates.loading")}</p>
                                            )}
                                            {certificatesError && (
                                                <p className="fsz-12 text-danger mb-0">
                                                    {t("certificates.couldNotLoad")}{" "}
                                                    <button
                                                        type="button"
                                                        className="btn btn-link btn-sm p-0 align-baseline"
                                                        onClick={() => refetchCertificates()}
                                                    >
                                                        {t("certificates.retry")}
                                                    </button>
                                                </p>
                                            )}
                                            {!certificatesLoading &&
                                                !certificatesError &&
                                                certificationOptions.length === 0 && (
                                                <p className="fsz-12 text-muted mb-0">{t("certificates.empty")}</p>
                                            )}
                                            {certificationOptions.map((cert) => (
                                                <div className="form-check" key={cert.id}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`cert-${cert.id}`}
                                                        checked={formData.certifications.includes(cert.id)}
                                                        onChange={() => toggleListValue("certifications", cert.id)}
                                                    />
                                                    <label className="form-check-label fsz-13" htmlFor={`cert-${cert.id}`}>
                                                        {cert.label}
                                                        {cert.tag && (
                                                            <span className="text-muted ms-2 fsz-11">({cert.tag})</span>
                                                        )}
                                                        {cert.draft && (
                                                            <span className="text-muted fsz-11 ms-1">({statusText("Draft")})</span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>

                                    {/* Gallery & video */}
                                    <Section
                                        title={t("companies.galleryVideo")}
                                        hint={t("companies.galleryHint")}
                                    >
                                        <FileUpload
                                            files={formData.gallery}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, gallery: files }))}
                                            maxFiles={12}
                                            accept={GALLERY_ACCEPT}
                                            title={t("companies.dropMedia")}
                                            hint={t("companies.galleryFormats")}
                                        />
                                        <div className="mt-3">
                                            <label className="form-label">{t("companies.video")}</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="video_url"
                                                dir="ltr"
                                                value={formData.video_url}
                                                onChange={handleChange}
                                                placeholder="https://"
                                            />
                                        </div>
                                    </Section>

                                    {/* Publishing */}
                                    <Section title={t("companies.publishing")}>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("common.status")}</label>
                                                <Select
                                                    options={statusOptions}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    isRtl={isRtl}
                                                    value={statusOptions.find((o) => o.value === formData.status)}
                                                    onChange={(o) => setFormData((p) => ({ ...p, status: o.value }))}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("common.type")}</label>
                                                <Select
                                                    options={typeOptions}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    isRtl={isRtl}
                                                    value={typeOptions.find((o) => o.value === formData.type)}
                                                    onChange={(o) => setFormData((p) => ({ ...p, type: o.value }))}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("companies.displayOrder")}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="display_order"
                                                    dir="ltr"
                                                    min="1"
                                                    value={formData.display_order}
                                                    onChange={handleChange}
                                                    placeholder="1"
                                                />
                                                <small className="text-muted fsz-11">{t("companies.orderHint")}</small>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Logo & cover */}
                                    <Section title={t("companies.logoCover")} hint={t("companies.logoHint")}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <FileUpload
                                                    files={formData.logoFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, logoFiles: files }))}
                                                    maxFiles={1}
                                                    accept={LOGO_ACCEPT}
                                                    title={t("clients.upload")}
                                                    hint={t("companies.logoSaveHint")}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, coverFiles: files }))}
                                                    maxFiles={1}
                                                    accept={COVER_ACCEPT}
                                                    title={t("companies.uploadCover")}
                                                    hint={t("companies.coverSaveHint")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Contact & links */}
                                    <Section title={t("companies.contactLinks")}>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("common.phone")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phone"
                                                    dir="ltr"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+966 ..."
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("common.email")}</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    dir="ltr"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.emailPh")}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">{t("common.website")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="website"
                                                    dir="ltr"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Brochure */}
                                    <Section title={t("status.brochure")} hint={t("companies.brochureHint")}>
                                        <FileUpload
                                            files={formData.brochureFiles}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, brochureFiles: files }))}
                                            maxFiles={1}
                                            accept={PDF_ACCEPT}
                                            title={t("certificates.uploadPdf")}
                                            hint={t("companies.pdfSaveHint")}
                                        />
                                    </Section>

                                    {/* SEO */}
                                    <Section title={t("companies.seo")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("posts.metaTitle")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="seo_title"
                                                    dir={textDir}
                                                    maxLength={60}
                                                    value={formData.seo_title}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.metaTitlePh")}
                                                />
                                                <small className="text-muted fsz-11">{t("companies.charCount", { count: seoTitleCount, max: 60 })}</small>
                                            </div>
                                            <div className="col-12 mb-1">
                                                <label className="form-label">{t("posts.metaDescription")}</label>
                                                <textarea
                                                    className="form-control"
                                                    name="seo_description"
                                                    dir={textDir}
                                                    rows="3"
                                                    maxLength={160}
                                                    value={formData.seo_description}
                                                    onChange={handleChange}
                                                    placeholder={t("companies.metaDescPh")}
                                                />
                                                <small className="text-muted fsz-11">{t("companies.charCount", { count: seoDescCount, max: 160 })}</small>
                                            </div>
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="butn-st2 butn-md line-butn" onClick={onClose}>
                                    {t("common.close")}
                                </button>
                                <button type="submit" className="butn-st2 butn-md">
                                    {company ? t("companies.update") : t("common.save")}
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
