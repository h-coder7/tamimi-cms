"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useIndustries } from "@/hooks/useIndustries";
import { buildIndustryFormOptions } from "@/lib/industryOptions";
import { PARTNER_TYPES } from "@/hooks/useClientsPartners";
import { useI18n } from "@/hooks/useI18n";

const LOGO_ACCEPT = {
    "image/svg+xml": [".svg"],
    "image/png": [".png"],
};

const emptyForm = () => ({
    title: "",
    type: "Client",
    industryId: "",
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
    const { t, isRtl, statusText, text } = useI18n();
    const textDir = isRtl ? "rtl" : "ltr";
    const { data: industries = [] } = useIndustries();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

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

    const typeOptions = useMemo(
        () => PARTNER_TYPES.map((type) => ({ value: type, label: statusText(type) })),
        [statusText]
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

        if (partner) {
            setFormData({
                title: partner.title || "",
                type: partner.type || "Client",
                industryId: partner.industryId || "",
                industry: partner.industry || "",
                website: partner.website || "",
                status: partner.status || "Draft",
                display_order: partner.display_order != null ? String(partner.display_order) : "1",
                logoFiles: partner.logo
                    ? [{ preview: partner.logo, type: "image/svg+xml", name: t("clients.logo") }]
                    : [],
                logoPath: partner.logoPath || null,
                is_sample: Boolean(partner.is_sample),
            });
        } else {
            setFormData({
                ...emptyForm(),
                display_order: String(nextOrder || 1),
            });
        }
    }, [isOpen, partner, nextOrder, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "display_order" && value && !/^\d*$/.test(value)) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const website = formData.website.trim();

        const selectedIndustry = industries.find((i) => i.id === formData.industryId);

        onSave({
            title: formData.title.trim(),
            type: formData.type,
            industryId: formData.industryId || null,
            industry: selectedIndustry?.title || "",
            website,
            status: formData.status,
            display_order: formData.display_order === "" ? 1 : Number(formData.display_order),
            logo: formData.logoFiles?.[0]?.preview || partner?.logo || "",
            logoFiles: formData.logoFiles,
            logoPath: formData.logoPath || partner?.logoPath || null,
            is_sample: Boolean(formData.is_sample),
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
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {partner ? t("clients.edit") : t("clients.add")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("clients.details")}>
                                        <div className="row">
                                            <div className="col-lg-8 mb-3">
                                                <label className="form-label">
                                                    {t("clients.name")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={textDir}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("clients.namePh")}
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    {t("common.type")} <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={typeOptions}
                                                    isRtl={isRtl}
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
                                                <label className="form-label">{t("common.industry")}</label>
                                                <Select
                                                    options={industryOptions}
                                                    isRtl={isRtl}
                                                    value={
                                                        industryOptions.find(
                                                            (o) => o.value === formData.industryId
                                                        ) || null
                                                    }
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            industryId: opt?.value || "",
                                                            industry: opt?.label || "",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    placeholder={t("projects.selectIndustry")}
                                                    isClearable
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("common.website")}</label>
                                                <input
                                                    type="url"
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

                                    <Section title={t("clients.logo")}>
                                        <FileUpload
                                            files={formData.logoFiles}
                                            onFilesChange={(files) =>
                                                setFormData((prev) => ({ ...prev, logoFiles: files }))
                                            }
                                            accept={LOGO_ACCEPT}
                                            maxFiles={1}
                                            title={t("clients.upload")}
                                            hint={t("clients.logoHint")}
                                        />
                                    </Section>

                                    <Section title={t("companies.publishing")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
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
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("companies.displayOrder")}</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    name="display_order"
                                                    dir="ltr"
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
                                    {t("common.cancel")}
                                </button>
                                <button type="submit" className="butn-st2" disabled={!formData.type}>
                                    {partner ? t("clients.update") : t("clients.add")}
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
