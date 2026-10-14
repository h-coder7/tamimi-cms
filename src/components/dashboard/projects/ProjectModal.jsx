"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { buildIndustryFormOptions } from "@/lib/industryOptions";
import { useIndustries, VALUE_CHAIN_STAGES } from "@/hooks/useIndustries";

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
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const { data: industries = [], refetch: refetchIndustries } = useIndustries();
    const [formData, setFormData] = useState(emptyForm);
    const [serviceInput, setServiceInput] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: "Draft" },
            { value: "Published", label: "Published" },
        ],
        []
    );

    const companyOptions = useMemo(
        () => buildCompanyFormOptions(companies),
        [companies]
    );

    const industryOptions = useMemo(
        () => buildIndustryFormOptions(industries),
        [industries]
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
                        name: `Gallery ${idx + 1}`,
                        type: item.videoUrl || String(item.url || "").includes(".mp4")
                            ? "video/mp4"
                            : "image/jpeg",
                    }))
                    : Array.isArray(project.gallery)
                        ? project.gallery.map((item, idx) => (
                            typeof item === "string"
                                ? { preview: item, name: `Gallery ${idx + 1}`, type: "image/jpeg" }
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
                    ? [{ preview: project.cover, type: "image/jpeg", name: "Cover" }]
                    : [],
                coverPath: project.coverPath || null,
                is_sample: Boolean(project.is_sample),
                content_label: project.content_label || "",
            });
        } else {
            setFormData(emptyForm());
        }

        setServiceInput("");
    }, [isOpen, project]);

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
                                {project ? "Edit Project" : "Add New Project"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title="Project details">
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">
                                                    Project name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Project name"
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    Client <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="client"
                                                    required
                                                    value={formData.client}
                                                    onChange={handleChange}
                                                    placeholder="Client name"
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Location</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">Summary</label>
                                                    <small className={`fsz-11 ${summaryCount >= SUMMARY_MAX ? "text-danger" : "text-muted"}`}>
                                                        {summaryCount}/{SUMMARY_MAX}
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
                                        </div>
                                    </Section>

                                    <Section title="Case study">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">The challenge</label>
                                                <textarea
                                                    className="form-control"
                                                    name="challenge"
                                                    rows={3}
                                                    value={formData.challenge}
                                                    onChange={handleChange}
                                                    placeholder="Describe the challenge"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Our solution</label>
                                                <textarea
                                                    className="form-control"
                                                    name="solution"
                                                    rows={3}
                                                    value={formData.solution}
                                                    onChange={handleChange}
                                                    placeholder="Describe the solution"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">The result</label>
                                                <textarea
                                                    className="form-control"
                                                    name="result"
                                                    rows={3}
                                                    value={formData.result}
                                                    onChange={handleChange}
                                                    placeholder="Describe the result"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        title="Scope & services"
                                        hint="Services delivered on this project. Shown as a numbered list on the project page."
                                    >
                                        {formData.services.length === 0 ? (
                                            <div className="text-muted fsz-12 mb-2">No services added yet</div>
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
                                                placeholder="Type a service, e.g. Valves"
                                            />
                                            <button type="button" className="butn-st2 butn-md" onClick={addService}>
                                                + Add
                                            </button>
                                        </div>
                                    </Section>

                                    <Section
                                        title="Gallery"
                                        hint="JPG / WEBP up to 5 MB each · MP4 up to 50 MB"
                                    >
                                        <FileUpload
                                            files={formData.gallery}
                                            onFilesChange={(files) => setFormData((prev) => ({ ...prev, gallery: files }))}
                                            accept={GALLERY_ACCEPT}
                                            maxFiles={12}
                                            title="Drop project photos or video"
                                            hint="JPG / WEBP up to 5 MB each · MP4 up to 50 MB"
                                        />
                                    </Section>

                                    <Section title="Links">
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Delivered by (company) <span className="text-danger">*</span>
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
                                                    classNamePrefix="react-select"
                                                    placeholder="Select company"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Industry <span className="text-danger">*</span>
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
                                                    classNamePrefix="react-select"
                                                    placeholder="Select industry"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">Year</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="year"
                                                    value={formData.year}
                                                    onChange={handleChange}
                                                    placeholder="2025"
                                                    inputMode="numeric"
                                                />
                                                <small className="text-muted fsz-11">4-digit year</small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label d-block mb-2">Value-chain stages</label>
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
                                                                {stage}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <small className="text-muted fsz-11 d-block mt-2">
                                                    Select one or more. The five stages are the fixed Industries We Power value chain (Industries module). Shown on the project page and used for filtering.
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="Publishing">
                                        <div className="row">
                                            <div className="col-lg-4 mb-3">
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
                                                        Featured on Home page and Project Experience
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Cover image</label>
                                                <FileUpload
                                                    files={formData.coverFiles}
                                                    onFilesChange={(files) => setFormData((prev) => ({ ...prev, coverFiles: files }))}
                                                    accept={COVER_ACCEPT}
                                                    maxFiles={1}
                                                    title="Upload cover"
                                                    hint="JPG / WEBP · 1600×900 recommended"
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
                                <button
                                    type="submit"
                                    className="butn-st2"
                                    disabled={!formData.companyId || !formData.industryId}
                                >
                                    {project ? "Update Project" : "Add Project"}
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
