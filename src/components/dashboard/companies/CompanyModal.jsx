"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";

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

const INDUSTRY_OPTIONS = [
    "Oil & Gas",
    "Power Generation",
    "Utilities",
    "Water & Desalination",
    "Petrochemicals",
    "Industrial Manufacturing",
    "Renewable Energy",
    "Infrastructure",
    "Automation & Digital Solutions",
];

const VALUE_CHAIN_OPTIONS = [
    "Engineering & Design",
    "Manufacturing & Fabrication",
    "Supply & Distribution",
    "Installation & Commissioning",
    "Operations & Maintenance",
];

const CERTIFICATION_OPTIONS = [
    { id: "iso-9001", label: "ISO 9001:2015 — Quality management", tag: "ISO" },
    { id: "aramco-electrical", label: "Saudi Aramco approved supplier — electrical materials", tag: "Saudi Aramco approval" },
    { id: "sec-vendor", label: "SEC approved vendor — electrical equipment", tag: "Other" },
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
    const [formData, setFormData] = useState(emptyForm);
    const [serviceInput, setServiceInput] = useState("");
    const [productInput, setProductInput] = useState("");
    const [dragServiceIndex, setDragServiceIndex] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (company) {
            setFormData({
                title: company.title || "",
                code: company.code || "",
                tagline: company.tagline || "",
                year_established: company.year_established || "",
                overview: company.overview || company.field || company.description || "",
                services: Array.isArray(company.services) ? company.services : [],
                products: Array.isArray(company.products) ? company.products : [],
                industries: Array.isArray(company.industries) ? company.industries : [],
                value_chain: Array.isArray(company.value_chain) ? company.value_chain : [],
                certifications: Array.isArray(company.certifications) ? company.certifications : [],
                gallery: Array.isArray(company.gallery)
                    ? company.gallery.map((item, idx) => (
                        typeof item === "string"
                            ? { preview: item, name: `Gallery ${idx + 1}`, type: "image/jpeg" }
                            : item
                    ))
                    : [],
                video_url: company.video_url || "",
                status: company.status || "Draft",
                type: company.type || "Subsidiary",
                display_order: company.display_order ?? "",
                logoFiles: company.image
                    ? [{ preview: company.image, type: "image/png", name: "Logo" }]
                    : [],
                coverFiles: company.cover
                    ? [{ preview: company.cover, type: "image/jpeg", name: "Cover" }]
                    : [],
                phone: company.phone || "",
                email: company.email || "",
                website: company.website || company.domain || "",
                brochureFiles: company.brochure
                    ? [{ preview: company.brochure, type: "application/pdf", name: "Brochure.pdf" }]
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
    }, [company, isOpen]);

    const typeOptions = useMemo(() => [
        { value: "Subsidiary", label: "Subsidiary" },
        { value: "Joint Venture", label: "Joint Venture" },
    ], []);

    const statusOptions = useMemo(() => [
        { value: "Draft", label: "Draft" },
        { value: "Published", label: "Published" },
    ], []);

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
            year_established: formData.year_established.trim(),
            overview: formData.overview.trim(),
            field: formData.overview.trim(),
            description: formData.overview.trim(),
            services: formData.services,
            products: formData.products,
            industries,
            industries_count: industries.length,
            industries_label: `${industries.length} industries · draft`,
            value_chain: formData.value_chain,
            certifications: formData.certifications,
            gallery: formData.gallery.map((file) => file.preview),
            video_url: formData.video_url.trim(),
            status: formData.status,
            type: formData.type,
            display_order: formData.display_order === "" ? null : Number(formData.display_order),
            image: formData.logoFiles?.[0]?.preview || "",
            cover: formData.coverFiles?.[0]?.preview || "",
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            website,
            domain: pendingWebsite || !website
                ? ""
                : (website.startsWith("http") ? website : `https://${website}`),
            brochure: formData.brochureFiles?.[0]?.preview || "",
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

    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {company ? "Edit Company" : "Add New Company"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    {/* Basic information */}
                                    <Section title="Basic information">
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">Company name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Company name"
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">Short name / code <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="code"
                                                    required
                                                    value={formData.code}
                                                    onChange={handleChange}
                                                    placeholder="e.g. SESCO"
                                                />
                                            </div>
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">Tagline</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="tagline"
                                                    value={formData.tagline}
                                                    onChange={handleChange}
                                                    placeholder="Short company tagline"
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">Year established</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="year_established"
                                                    value={formData.year_established}
                                                    onChange={handleChange}
                                                    placeholder="4-digit year"
                                                    maxLength={4}
                                                    pattern="[0-9]{4}"
                                                />
                                                <small className="text-muted fsz-11">4-digit year</small>
                                            </div>
                                            <div className="col-12 mb-1">
                                                <label className="form-label">Overview <span className="text-danger">*</span></label>
                                                <textarea
                                                    className="form-control"
                                                    name="overview"
                                                    rows="4"
                                                    required
                                                    maxLength={600}
                                                    value={formData.overview}
                                                    onChange={handleChange}
                                                    placeholder="Company overview"
                                                />
                                                <small className="text-muted fsz-11">
                                                    Max 600 characters · shown on the company page and cards · {overviewCount}/600
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Services & products */}
                                    <Section
                                        title="Services & products"
                                        hint="Type a service name and press Enter or Add · drag order = display order on the company page · max 12"
                                    >
                                        <div className="mb-3">
                                            <label className="form-label">Core services</label>
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
                                                        title="Drag to reorder"
                                                    >
                                                        <i className="fal fa-grip-lines-vertical text-muted"></i>
                                                        {service}
                                                        <button
                                                            type="button"
                                                            className="btn p-0 border-0 text-muted"
                                                            onClick={() => removeService(index)}
                                                            aria-label={`Remove ${service}`}
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
                                                    placeholder="+ Add service"
                                                    disabled={formData.services.length >= 12}
                                                />
                                                <button
                                                    type="button"
                                                    className="butn-st2 butn-md"
                                                    onClick={addService}
                                                    disabled={formData.services.length >= 12}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label">Featured products (max 6)</label>
                                            {formData.products.length === 0 ? (
                                                <div className="text-muted fsz-12 mb-2">No products yet</div>
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
                                                    placeholder="+ Add product"
                                                    disabled={formData.products.length >= 6}
                                                />
                                                <button
                                                    type="button"
                                                    className="butn-st2 butn-md"
                                                    onClick={addProduct}
                                                    disabled={formData.products.length >= 6}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Industries We Power */}
                                    <Section
                                        title="Industries We Power"
                                        hint="Draft mapping prepared by Inspire from each company's published activities. Awaiting approval from the client marketing team."
                                    >
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label d-block mb-2">Industries served</label>
                                                <div className="d-flex flex-column gap-2">
                                                    {INDUSTRY_OPTIONS.map((industry) => (
                                                        <div className="form-check" key={industry}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`industry-${industry}`}
                                                                checked={formData.industries.includes(industry)}
                                                                onChange={() => toggleListValue("industries", industry)}
                                                            />
                                                            <label className="form-check-label fsz-13" htmlFor={`industry-${industry}`}>
                                                                {industry}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label d-block mb-2">Value-chain stages</label>
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
                                                                {stage}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Certifications */}
                                    <Section
                                        title="Certifications"
                                        hint="Certificates are added in the Certificates module with Holder = this company. They appear automatically in the Certifications section of the company page."
                                    >
                                        <div className="mb-2">
                                            <span className="badge bg-light text-dark border fsz-11">Manage in Certificates →</span>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                            {CERTIFICATION_OPTIONS.map((cert) => (
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
                                                        <span className="text-muted ms-2 fsz-11">({cert.tag})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>

                                    {/* Gallery & video */}
                                    <Section
                                        title="Gallery & video"
                                        hint="JPG, PNG, WEBP up to 5 MB · MP4 up to 50 MB · or paste a YouTube / Vimeo link"
                                    >
                                        <FileUpload
                                            files={formData.gallery}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, gallery: files }))}
                                            maxFiles={12}
                                            accept={GALLERY_ACCEPT}
                                            title="Drop images or video here, or browse"
                                            hint="JPG, PNG, WEBP · MP4"
                                        />
                                        <div className="mt-3">
                                            <label className="form-label">YouTube / Vimeo link</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="video_url"
                                                value={formData.video_url}
                                                onChange={handleChange}
                                                placeholder="https://"
                                            />
                                        </div>
                                    </Section>

                                    {/* Publishing */}
                                    <Section title="Publishing">
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    value={statusOptions.find((o) => o.value === formData.status)}
                                                    onChange={(o) => setFormData((p) => ({ ...p, status: o.value }))}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Type</label>
                                                <Select
                                                    options={typeOptions}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    value={typeOptions.find((o) => o.value === formData.type)}
                                                    onChange={(o) => setFormData((p) => ({ ...p, type: o.value }))}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Display order</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="display_order"
                                                    min="1"
                                                    value={formData.display_order}
                                                    onChange={handleChange}
                                                    placeholder="1"
                                                />
                                                <small className="text-muted fsz-11">Lower numbers show first</small>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Logo & cover */}
                                    <Section title="Logo & cover" hint="Logo: SVG or PNG, max 2 MB">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <FileUpload
                                                    files={formData.logoFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, logoFiles: files }))}
                                                    maxFiles={1}
                                                    accept={LOGO_ACCEPT}
                                                    title="Upload logo"
                                                    hint="SVG or PNG"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, coverFiles: files }))}
                                                    maxFiles={1}
                                                    accept={COVER_ACCEPT}
                                                    title="Upload cover image"
                                                    hint="JPG, PNG, WEBP"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Contact & links */}
                                    <Section title="Contact & links">
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+966 ..."
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Inquiries for this company are routed here"
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Website</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Brochure */}
                                    <Section title="Brochure" hint="Upload PDF (max 10 MB)">
                                        <FileUpload
                                            files={formData.brochureFiles}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, brochureFiles: files }))}
                                            maxFiles={1}
                                            accept={PDF_ACCEPT}
                                            title="Upload PDF"
                                            hint="PDF only"
                                        />
                                    </Section>

                                    {/* SEO */}
                                    <Section title="SEO">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Meta title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="seo_title"
                                                    maxLength={60}
                                                    value={formData.seo_title}
                                                    onChange={handleChange}
                                                    placeholder="Company | Tamimi Energy Group"
                                                />
                                                <small className="text-muted fsz-11">{seoTitleCount} / 60 characters</small>
                                            </div>
                                            <div className="col-12 mb-1">
                                                <label className="form-label">Meta description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="seo_description"
                                                    rows="3"
                                                    maxLength={160}
                                                    value={formData.seo_description}
                                                    onChange={handleChange}
                                                    placeholder="Short SEO description"
                                                />
                                                <small className="text-muted fsz-11">{seoDescCount} / 160 characters</small>
                                            </div>
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="butn-st2 butn-md line-butn" onClick={onClose}>
                                    Close
                                </button>
                                <button type="submit" className="butn-st2 butn-md">
                                    {company ? "Update" : "Save"}
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
