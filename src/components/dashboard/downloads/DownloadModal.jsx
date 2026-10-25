"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { DOWNLOAD_TYPES, DOWNLOAD_STATUSES } from "@/hooks/useDownloads";
import {
    GROUP_CODE,
    GROUP_VALUE,
    buildCompanyFormOptions,
} from "@/lib/companyOptions";
import { toast } from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

const DESC_MAX = 160;

const IMAGE_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};

const PDF_ACCEPT = {
    "application/pdf": [".pdf"],
};

const TYPE_KEY = {
    "Company profile": "company_profile",
    Brochure: "brochure",
    Policy: "policy",
    Other: "other",
};

const emptyForm = () => ({
    title: "",
    title_ar: "",
    type: "",
    company: "group",
    company_code: GROUP_CODE,
    pdfFiles: [],
    coverFiles: [],
    description: "",
    description_ar: "",
    status: "Draft",
});

export default function DownloadModal({ isOpen, onClose, onSave, download }) {
    const { t, isRtl, statusText, text } = useI18n();
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [lang, setLang] = useState("en");
    const [isMounted, setIsMounted] = useState(false);

    const typeOptions = useMemo(
        () =>
            DOWNLOAD_TYPES.map((type) => ({
                value: type,
                label: statusText(TYPE_KEY[type] || type),
            })),
        [statusText]
    );

    const companyOptions = useMemo(() => {
        return buildCompanyFormOptions(companies, { includeGroup: true }).map((opt) => {
            if (opt.value === GROUP_VALUE) return { ...opt, label: statusText("group") };
            const company = companies.find((item) => item.id === opt.value);
            if (!company) return opt;
            const name = text(company.i18nTitle, company.title || "");
            const label = company.code ? `${company.code} — ${name}`.trim() : name;
            return { ...opt, label: label || opt.label };
        });
    }, [companies, statusText, text]);

    const statusOptions = useMemo(
        () =>
            DOWNLOAD_STATUSES.map((status) => ({
                value: status,
                label: statusText(status),
            })),
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

        setLang("en");

        if (download) {
            const status =
                download.publish_status ||
                (download.status === "Pending file" ? "Draft" : download.status) ||
                "Draft";
            setFormData({
                title: download.title || "",
                title_ar: download.title_ar || "",
                type: download.type || "",
                company: download.company || "group",
                company_code: download.company_code || GROUP_CODE,
                pdfFiles: download.file
                    ? [{ preview: download.file, type: "application/pdf", name: "File.pdf" }]
                    : [],
                coverFiles: download.cover
                    ? [{ preview: download.cover, type: "image/jpeg", name: t("common.cover") }]
                    : [],
                description: download.description || "",
                description_ar: download.description_ar || "",
                status: DOWNLOAD_STATUSES.includes(status) ? status : "Draft",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, download, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === "description" || name === "description_ar") && value.length > DESC_MAX) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error(t("validation.titleEn"));
            return;
        }
        if (!formData.type || !formData.company) {
            toast.error(t("validation.typeCompany"));
            return;
        }
        const hasNewPdf = formData.pdfFiles?.[0]?.file instanceof File;
        if (!download && !hasNewPdf) {
            toast.error(t("validation.pdf"));
            return;
        }

        const selected =
            formData.company !== GROUP_VALUE
                ? companies.find((c) => c.id === formData.company)
                : null;

        onSave({
            title: formData.title.trim(),
            title_ar: formData.title_ar.trim(),
            type: formData.type,
            company: formData.company || GROUP_VALUE,
            company_code:
                formData.company === GROUP_VALUE
                    ? GROUP_CODE
                    : selected?.code || formData.company_code || "",
            company_label:
                formData.company === GROUP_VALUE
                    ? "Tamimi Energy Group"
                    : selected?.title || selected?.code || "",
            pdfFiles: formData.pdfFiles,
            coverFiles: formData.coverFiles,
            description: formData.description.trim(),
            description_ar: formData.description_ar.trim(),
            status: formData.status || "Draft",
            publish_status: formData.status || "Draft",
        });
    };

    if (!isOpen || !isMounted) return null;

    const titleValue = lang === "en" ? formData.title : formData.title_ar;
    const titleName = lang === "en" ? "title" : "title_ar";
    const descValue = lang === "en" ? formData.description : formData.description_ar;
    const descName = lang === "en" ? "description" : "description_ar";
    const fieldRtl = lang === "ar";

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
                                {download ? t("downloads.edit") : t("downloads.add")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <ul className="nav nav-pills mb-4 gap-2">
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link fsz-12 px-3 py-2 ${lang === "en" ? "active" : ""}`}
                                            onClick={() => setLang("en")}
                                        >
                                            {t("common.english")}
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link fsz-12 px-3 py-2 ${lang === "ar" ? "active" : ""}`}
                                            onClick={() => setLang("ar")}
                                        >
                                            {t("common.arabic")}
                                        </button>
                                    </li>
                                </ul>

                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label className="form-label">
                                            {lang === "en" ? t("downloads.titleEn") : t("downloads.titleAr")}{" "}
                                            <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name={titleName}
                                            required={lang === "en"}
                                            dir={fieldRtl ? "rtl" : "ltr"}
                                            value={titleValue}
                                            onChange={handleChange}
                                            placeholder={t("downloads.titlePh")}
                                        />
                                        <div className="form-text fsz-11">
                                            {t("downloads.shownAs")}
                                        </div>
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
                                                    type: opt?.value || "",
                                                }))
                                            }
                                            placeholder={t("downloads.selectType")}
                                            isRtl={isRtl}
                                            classNamePrefix="react-select"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>

                                    <div className="col-lg-6 mb-3">
                                        <label className="form-label">
                                            {t("common.company")} <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={companyOptions}
                                            value={companyOptions.find((o) => o.value === formData.company) || null}
                                            onChange={(opt) => {
                                                const value = opt?.value || GROUP_VALUE;
                                                const selected =
                                                    value !== GROUP_VALUE
                                                        ? companies.find((c) => c.id === value)
                                                        : null;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    company: value,
                                                    company_code:
                                                        value === GROUP_VALUE
                                                            ? GROUP_CODE
                                                            : selected?.code || "",
                                                }));
                                            }}
                                            placeholder={t("downloads.selectCompany")}
                                            isRtl={isRtl}
                                            classNamePrefix="react-select"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        />
                                        <div className="form-text fsz-11">
                                            {t("downloads.alsoListed")}
                                        </div>
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label">
                                            {t("downloads.filePdf")} {!download && <span className="text-danger">*</span>}
                                        </label>
                                        <FileUpload
                                            files={formData.pdfFiles}
                                            onFilesChange={(files) =>
                                                setFormData((prev) => ({ ...prev, pdfFiles: files }))
                                            }
                                            maxFiles={1}
                                            accept={PDF_ACCEPT}
                                            title={t("downloads.uploadPdf")}
                                            hint={t("downloads.pdfHint")}
                                        />
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label">{t("downloads.thumbnail")}</label>
                                        <FileUpload
                                            files={formData.coverFiles}
                                            onFilesChange={(files) =>
                                                setFormData((prev) => ({ ...prev, coverFiles: files }))
                                            }
                                            maxFiles={1}
                                            accept={IMAGE_ACCEPT}
                                            title={t("downloads.uploadCover")}
                                            hint={t("downloads.coverHint")}
                                        />
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label">{t("common.description")}</label>
                                        <textarea
                                            className="form-control"
                                            name={descName}
                                            rows={3}
                                            dir={fieldRtl ? "rtl" : "ltr"}
                                            value={descValue}
                                            onChange={handleChange}
                                            placeholder={t("downloads.descPh")}
                                        />
                                        <div className="form-text fsz-11 text-end">
                                            {descValue.length}/{DESC_MAX}
                                        </div>
                                    </div>

                                    <div className="col-lg-6 mb-3">
                                        <label className="form-label">{t("common.status")}</label>
                                        <Select
                                            options={statusOptions}
                                            value={statusOptions.find((o) => o.value === formData.status) || statusOptions[0]}
                                            onChange={(opt) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    status: opt?.value || "Draft",
                                                }))
                                            }
                                            isRtl={isRtl}
                                            classNamePrefix="react-select"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    {t("common.cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t("common.save")}
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
