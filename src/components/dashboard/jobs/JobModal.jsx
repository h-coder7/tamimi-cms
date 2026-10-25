"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { useCompanies } from "@/hooks/useCompanies";
import { JOB_CITIES, JOB_STATUSES } from "@/hooks/useJobs";
import { buildCompanyFormOptions } from "@/lib/companyOptions";
import { toast } from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

const emptyForm = () => ({
    title: "",
    city: "Al Khobar",
    company: "group",
    company_code: "TEG",
    experience: "",
    vacancies: "1",
    description: "",
    requirements: "",
    status: "Open",
    deadline: "",
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function JobModal({ isOpen, onClose, onSave, job }) {
    const { t, isRtl, statusText } = useI18n();
    const { data: companies = [], refetch: refetchCompanies } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);
    const [saving, setSaving] = useState(false);

    const statusOptions = useMemo(
        () => JOB_STATUSES.map((status) => ({ value: status, label: statusText(status) })),
        [statusText]
    );

    const cityOptions = useMemo(
        () => JOB_CITIES.map((city) => ({ value: city, label: statusText(city) })),
        [statusText]
    );

    const companyOptions = useMemo(
        () =>
            buildCompanyFormOptions(companies, { includeGroup: true }).map((opt) =>
                opt.value === "group" || opt.label === "Tamimi Energy Group"
                    ? { ...opt, label: t("status.group") }
                    : opt
            ),
        [companies, t]
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

        if (job) {
            setFormData({
                title: job.title || "",
                city: job.city || "Al Khobar",
                company: job.company || "group",
                company_code: job.company_code || "TEG",
                experience: job.experience || "",
                vacancies: String(job.vacancies ?? 1),
                description: job.description || "",
                requirements: job.requirements || "",
                status: job.status || "Open",
                deadline: job.deadline || "",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, job]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error(t("validation.jobTitle"));
            return;
        }
        if (!formData.description.trim()) {
            toast.error(t("validation.jobDescription"));
            return;
        }
        if (!formData.requirements.trim()) {
            toast.error(t("validation.requirements"));
            return;
        }
        if (!formData.deadline) {
            toast.error(t("validation.deadline"));
            return;
        }
        const vacancies = Number(formData.vacancies);
        if (!Number.isFinite(vacancies) || vacancies < 1) {
            toast.error(t("validation.vacancies"));
            return;
        }

        const company =
            formData.company !== "group"
                ? companies.find((c) => c.id === formData.company)
                : null;

        setSaving(true);
        try {
            await onSave({
                title: formData.title.trim(),
                city: formData.city,
                company: formData.company || "group",
                company_code:
                    formData.company === "group"
                        ? "TEG"
                        : company?.code || formData.company_code || "",
                experience: formData.experience.trim(),
                vacancies,
                description: formData.description.trim(),
                requirements: formData.requirements.trim(),
                status: formData.status,
                deadline: formData.deadline || null,
            });
        } finally {
            setSaving(false);
        }
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
                                {job ? t("jobs.edit") : t("jobs.add")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("jobs.details")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    {t("jobs.column")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("jobs.titlePh")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("common.city")} <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={cityOptions}
                                                    value={cityOptions.find((o) => o.value === formData.city) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            city: opt?.value || "Al Khobar",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    placeholder={t("jobs.cityPh")}
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
                                                        const value = opt?.value || "group";
                                                        const selected =
                                                            value !== "group"
                                                                ? companies.find((c) => c.id === value)
                                                                : null;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            company: value,
                                                            company_code:
                                                                value === "group"
                                                                    ? "TEG"
                                                                    : selected?.code || "",
                                                        }));
                                                    }}
                                                    classNamePrefix="react-select"
                                                    placeholder={t("jobs.companyPh")}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("jobs.experience")}</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="experience"
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    placeholder={t("jobs.experiencePh")}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("common.vacancies")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    name="vacancies"
                                                    required
                                                    dir="ltr"
                                                    value={formData.vacancies}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("jobs.description")}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    {t("jobs.jobDescription")} <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    rows={5}
                                                    required
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder={t("jobs.descriptionPh")}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    {t("jobs.requirements")} <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    name="requirements"
                                                    rows={5}
                                                    required
                                                    dir={isRtl ? "rtl" : "ltr"}
                                                    value={formData.requirements}
                                                    onChange={handleChange}
                                                    placeholder={t("jobs.requirementsPh")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title={t("jobs.publishing")}>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">{t("common.status")}</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find((o) => o.value === formData.status) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            status: opt?.value || "Open",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label className="form-label">
                                                    {t("jobs.deadline")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="deadline"
                                                    required
                                                    dir="ltr"
                                                    value={formData.deadline}
                                                    onChange={handleChange}
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
                                    disabled={!formData.company || saving}
                                >
                                    {saving
                                        ? t("common.saving")
                                        : job
                                          ? t("jobs.update")
                                          : t("jobs.add")}
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
