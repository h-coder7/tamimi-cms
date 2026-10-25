"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { CERTIFICATE_TYPES } from "@/hooks/useCertificates";
import { useI18n } from "@/hooks/useI18n";

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
    const { t, isRtl, statusText } = useI18n();
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const typeOptions = useMemo(
        () => CERTIFICATE_TYPES.map((type) => ({ value: type, label: statusText(type) })),
        [statusText]
    );

    const holderOptions = useMemo(
        () =>
            buildCompanyFormOptions(companies, { includeGroup: true }).map((opt) =>
                opt.value === "group" || opt.label === "Tamimi Energy Group"
                    ? { ...opt, label: t("status.group") }
                    : opt
            ),
        [companies, t]
    );

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: statusText("Draft") },
            { value: "Published", label: statusText("Published") },
        ],
        [statusText]
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
                    ? [{ preview: certificate.image, type: "image/jpeg", name: t("certificates.column") }]
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
    }, [isOpen, certificate, t]);

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
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {certificate ? t("certificates.edit") : t("certificates.add")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("certificates.details")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("certificates.name")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("certificates.namePh")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("common.type")} <span className="text-danger">*</span>
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
                                                <label className="form-label">{t("certificates.issuingBody")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="issuing_body"
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.issuing_body}
                                                    onChange={handleChange}
                                                    placeholder={t("certificates.issuingBodyPh")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("certificates.holder")} <span className="text-danger">*</span>
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
                                                    placeholder={t("status.group")}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("certificates.expiryDate")}</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="expiry"
                                                    dir="ltr"
                                                    value={formData.expiry}
                                                    onChange={handleChange}
                                                />
                                                <small className="text-muted fsz-11">
                                                    {t("certificates.expiryHint")}
                                                </small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("certificates.files")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("certificates.image")}</label>
                                                <FileUpload
                                                    files={formData.imageFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, imageFiles: files }))
                                                    }
                                                    accept={IMAGE_ACCEPT}
                                                    maxFiles={1}
                                                    title={t("certificates.uploadImage")}
                                                    hint={t("certificates.imageHint")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("certificates.pdf")}</label>
                                                <FileUpload
                                                    files={formData.pdfFiles}
                                                    onFilesChange={(files) =>
                                                        setFormData((prev) => ({ ...prev, pdfFiles: files }))
                                                    }
                                                    accept={PDF_ACCEPT}
                                                    maxFiles={1}
                                                    title={t("certificates.uploadPdf")}
                                                    hint={t("certificates.pdfHint")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("certificates.publishing")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("common.status")}</label>
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
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="butn-st2"
                                    disabled={!formData.type || !formData.holder}
                                >
                                    {certificate ? t("certificates.update") : t("certificates.add")}
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
