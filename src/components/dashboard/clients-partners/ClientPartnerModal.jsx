"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useIndustries } from "@/hooks/useIndustries";
import { PARTNER_TYPES } from "@/hooks/useClientsPartners";

const LOGO_ACCEPT = {
    "image/svg+xml": [".svg"],
    "image/png": [".png"],
};

const emptyForm = () => ({
    title: "",
    type: "Client",
    industry: "",
    website: "",
    status: "Draft",
    display_order: "1",
    logoFiles: [],
    is_sample: false,
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function ClientPartnerModal({ isOpen, onClose, onSave, partner, nextOrder = 1 }) {
    const { data: industries = [] } = useIndustries();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const industryOptions = useMemo(
        () => industries.map((industry) => ({
            value: industry.title,
            label: industry.title,
        })),
        [industries]
    );

    const typeOptions = useMemo(
        () => PARTNER_TYPES.map((type) => ({ value: type, label: type })),
        []
    );

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: "Draft" },
            { value: "Published", label: "Published" },
        ],
        []
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (partner) {
            setFormData({
                title: partner.title || "",
                type: partner.type || "Client",
                industry: partner.industry || "",
                website: partner.website || "",
                status: partner.status || "Draft",
                display_order: partner.display_order != null ? String(partner.display_order) : "1",
                logoFiles: partner.logo
                    ? [{ preview: partner.logo, type: "image/svg+xml", name: "Logo" }]
                    : [],
                is_sample: Boolean(partner.is_sample),
            });
        } else {
            setFormData({
                ...emptyForm(),
                display_order: String(nextOrder || 1),
            });
        }
    }, [isOpen, partner, nextOrder]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "display_order" && value && !/^\d*$/.test(value)) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const website = formData.website.trim();

        onSave({
            title: formData.title.trim(),
            type: formData.type,
            industry: formData.industry,
            website,
            status: formData.status,
            display_order: formData.display_order === "" ? 1 : Number(formData.display_order),
            logo: formData.logoFiles?.[0]?.preview || "",
            is_sample: Boolean(formData.is_sample),
        });
    };

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {partner ? "Edit Logo" : "Add Logo"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title="Details">
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">
                                                    Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Client or partner name"
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    Type <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={typeOptions}
                                                    value={typeOptions.find((o) => o.value === formData.type) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            type: opt?.value || "Client",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Industry</label>
                                                <Select
                                                    options={industryOptions}
                                                    value={industryOptions.find((o) => o.value === formData.industry) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            industry: opt?.value || "",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    placeholder="Select industry"
                                                    isClearable
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Website</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="Logo">
                                        <FileUpload
                                            files={formData.logoFiles}
                                            onFilesChange={(files) =>
                                                setFormData((prev) => ({ ...prev, logoFiles: files }))
                                            }
                                            accept={LOGO_ACCEPT}
                                            maxFiles={1}
                                            title="Upload logo"
                                            hint="SVG or transparent PNG, max 1 MB"
                                        />
                                    </Section>

                                    <Section title="Publishing">
                                        <div className="row">
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
                                                <label className="form-label">Display order</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    name="display_order"
                                                    value={formData.display_order}
                                                    onChange={handleChange}
                                                    placeholder="1"
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
                                <button type="submit" className="butn-st2" disabled={!formData.type}>
                                    {partner ? "Update Logo" : "Add Logo"}
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
