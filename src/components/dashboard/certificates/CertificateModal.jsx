"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { CERTIFICATE_TYPES } from "@/hooks/useCertificates";

const IMAGE_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};

const PDF_ACCEPT = {
    "application/pdf": [".pdf"],
};

const emptyForm = () => ({
    title: "",
    type: "ISO",
    issuing_body: "",
    holder: "group",
    holder_code: "TEG",
    expiry: "",
    imageFiles: [],
    pdfFiles: [],
    imagePath: null,
    pdfPath: null,
    publish_status: "Draft",
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function CertificateModal({ isOpen, onClose, onSave, certificate }) {
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const typeOptions = useMemo(
        () => CERTIFICATE_TYPES.map((type) => ({ value: type, label: type })),
        []
    );

    const holderOptions = useMemo(
        () => buildCompanyFormOptions(companies, { includeGroup: true }),
        [companies]
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
        refetchCompanies();
    }, [isOpen, refetchCompanies]);

    useEffect(() => {
        if (!isOpen) return;

        if (certificate) {
            setFormData({
                title: certificate.title || "",
                type: certificate.type || "ISO",
                issuing_body: certificate.issuing_body || "",
                holder: certificate.holder || "group",
                holder_code: certificate.holder_code || "TEG",
                expiry: certificate.expiry || "",
                imageFiles: certificate.image
                    ? [{ preview: certificate.image, type: "image/jpeg", name: "Certificate" }]
                    : [],
                pdfFiles: certificate.pdf
                    ? [{ preview: certificate.pdf, type: "application/pdf", name: "Certificate.pdf" }]
                    : [],
                imagePath: certificate.imagePath || null,
                pdfPath: certificate.pdfPath || null,
                publish_status: certificate.publish_status || "Draft",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, certificate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const company =
            formData.holder !== "group"
                ? companies.find((c) => c.id === formData.holder)
                : null;

        onSave({
            title: formData.title.trim(),
            type: formData.type,
            issuing_body: formData.issuing_body.trim(),
            holder: formData.holder || "group",
            holder_code:
                formData.holder === "group" ? "TEG" : company?.code || formData.holder_code || "",
            expiry: formData.expiry || null,
            imageFiles: formData.imageFiles,
            pdfFiles: formData.pdfFiles,
            imagePath: formData.imagePath,
            pdfPath: formData.pdfPath,
            image: formData.imageFiles?.[0]?.preview || "",
            pdf: formData.pdfFiles?.[0]?.preview || "",
            publish_status: formData.publish_status || "Draft",
            is_sample: Boolean(certificate?.is_sample),
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
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {certificate ? "Edit Certificate" : "Add Certificate"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title="Details">
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Certificate name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. ISO 9001:2015"
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Type <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={typeOptions}
                                                    value={typeOptions.find((o) => o.value === formData.type) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            type: opt?.value || "ISO",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Issuing body</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="issuing_body"
                                                    value={formData.issuing_body}
                                                    onChange={handleChange}
                                                    placeholder="Certification body"
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    Holder <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={holderOptions}
                                                    value={holderOptions.find((o) => o.value === formData.holder) || null}
                                                    onChange={(opt) => {
                                                        const value = opt?.value || "group";
                                                        const company =
                                                            value !== "group"
                                                                ? companies.find((c) => c.id === value)
                                                                : null;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            holder: value,
                                                            holder_code: value === "group" ? "TEG" : company?.code || "",
                                                        }));
                                                    }}
                                                    classNamePrefix="react-select"
                                                    placeholder="Tamimi Energy Group"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Expiry date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="expiry"
                                                    value={formData.expiry}
                                                    onChange={handleChange}
                                                />
                                                <small className="text-muted fsz-11">
                                                    Optional · reminder 30 days before
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="Files">
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Certificate image</label>
                                                <FileUpload
                                                    files={formData.imageFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, imageFiles: files }))
                                                    }
                                                    accept={IMAGE_ACCEPT}
                                                    maxFiles={1}
                                                    title="Upload image"
                                                    hint="JPG / PNG for display"
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Certificate PDF</label>
                                                <FileUpload
                                                    files={formData.pdfFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, pdfFiles: files }))
                                                    }
                                                    accept={PDF_ACCEPT}
                                                    maxFiles={1}
                                                    title="Upload PDF"
                                                    hint="Optional download · max 10 MB"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="Publishing">
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find((o) => o.value === formData.publish_status) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            publish_status: opt?.value || "Draft",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
                                    disabled={!formData.type || !formData.holder}
                                >
                                    {certificate ? "Update Certificate" : "Add Certificate"}
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
