"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "../../shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import {
    VALUE_CHAIN_STAGES,
    emptyValueChainMapping,
    useValueChainStages,
    useIndustries,
} from "@/hooks/useIndustries";
import { publicPath } from "@/utils/publicPath";
import { useI18n } from "@/hooks/useI18n";

const SHORT_DESC_MAX = 140;
const INDUSTRY_NAME_MAX = 40;
const FULL_DESC_MAX = 1500;

const INDUSTRY_IMAGE_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};

const emptyForm = () => ({
    title: "",
    i18nTitle: { en: "", ar: "" },
    order: "",
    status: "Draft",
    short_description: "",
    overview: { title: { en: "", ar: "" }, firstDescription: { en: "", ar: "" }, secondDescription: { en: "", ar: "" } },
    full_description: "", i18nFullDescription: { en: "", ar: "" }, relatedIndustryIds: [],
    companies: [],
    value_chain_mapping: emptyValueChainMapping(),
    value_chain_stages: [],
    homepageBannerFiles: [],
    industryCardFiles: [],
    iconFiles: [],
    homepageBannerPath: null,
    industryCardPath: null, iconPath: null,
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

function initialIndustryForm(industry, t) {
    if (!industry) return emptyForm();
    const bannerUrl = industry.homepageBannerUrl || industry.homepageBanner || industry.coverUrl || industry.cover || "";
    const bannerPath = industry.homepageBannerPath || industry.coverPath || null;
    const cardUrl = industry.industryCardUrl || industry.industryCard || "";
    const iconUrl = industry.iconUrl || industry.icon || "";
    const cardPath = industry.industryCardPath || null;

    return {
        title: industry.title || "",
        i18nTitle: industry.i18nTitle || { en: industry.title || "", ar: "" },
        order: industry.order ?? "",
        status: industry.status || "Draft",
        short_description: industry.short_description || industry.description || "",
        i18nShortDescription: industry.i18nShortDescription || { en: industry.short_description || industry.description || "", ar: "" },
        overview: industry.overview || { title: { en: "", ar: "" }, firstDescription: { en: "", ar: "" }, secondDescription: { en: "", ar: "" } },
        full_description: industry.full_description || "", i18nFullDescription: industry.i18nFullDescription || { en: industry.full_description || "", ar: "" }, relatedIndustryIds: Array.isArray(industry.relatedIndustryIds) ? [...industry.relatedIndustryIds] : [],
        cover_video_url: industry.cover_video_url || "",
        companies: Array.isArray(industry.companies) ? [...industry.companies] : [],
        value_chain_mapping: { ...emptyValueChainMapping(), ...(industry.value_chain_mapping || {}) },
        value_chain_stages: Array.isArray(industry.value_chain_stages) ? [...industry.value_chain_stages] : [],
        homepageBannerFiles: bannerUrl ? [{ preview: bannerUrl, path: bannerPath, type: "image/jpeg", name: t("industries.homepageBanner") }] : [],
        industryCardFiles: cardUrl ? [{ preview: cardUrl, path: cardPath, type: "image/jpeg", name: t("industries.industryCard") }] : [],
        iconFiles: iconUrl ? [{ preview: iconUrl, path: industry.iconPath, type: "image/png", name: "Icon" }] : [],
        homepageBannerPath: bannerPath,
        industryCardPath: cardPath,
        iconPath: industry.iconPath || null,
    };
}

export default function IndustryModal({ isOpen, onClose, onSave, industry }) {
    const { t, isRtl, statusText, text } = useI18n();
    const textDir = isRtl ? "rtl" : "ltr";
    const { data: allCompanies = [] } = useCompanies();
    const { data: valueChainStages = [] } = useValueChainStages({ enabled: isOpen });
    const { data: allIndustries = [] } = useIndustries();
    const [formData, setFormData] = useState(() => initialIndustryForm(industry, t));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const relatedIndustryOptions = allIndustries.filter((item) => item.id !== industry?.id);

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: statusText("Draft") },
            { value: "Published", label: statusText("Published") },
        ],
        [statusText]
    );

    const companiesByCode = useMemo(() => {
        const map = {};
        allCompanies.forEach((company) => {
            if (company.code) map[company.code] = company;
        });
        return map;
    }, [allCompanies]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "short_description" && value.length > SHORT_DESC_MAX) return;
        setFormData((prev) => ({ ...prev, [name]: value, ...(name === "title" ? { i18nTitle: { ...(prev.i18nTitle || {}), en: value } } : {}) }));
    };

    const toggleCompany = (code) => {
        setFormData((prev) => {
            const exists = prev.companies.includes(code);
            if (exists) {
                const nextMapping = { ...prev.value_chain_mapping };
                VALUE_CHAIN_STAGES.forEach((stage) => {
                    nextMapping[stage] = (nextMapping[stage] || []).filter((c) => c !== code);
                });
                return {
                    ...prev,
                    companies: prev.companies.filter((c) => c !== code),
                    value_chain_mapping: nextMapping,
                };
            }
            return {
                ...prev,
                companies: [...prev.companies, code],
            };
        });
    };

    const toggleStageCompany = (stage, code) => {
        setFormData((prev) => {
            const current = prev.value_chain_mapping[stage] || [];
            const exists = current.includes(code);
            const nextStageCompanies = exists
                ? current.filter((c) => c !== code)
                : [...current, code];

            const nextCompanies = prev.companies.includes(code)
                ? prev.companies
                : [...prev.companies, code];

            return {
                ...prev,
                companies: nextCompanies,
                value_chain_mapping: {
                    ...prev.value_chain_mapping,
                    [stage]: nextStageCompanies,
                },
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        const bannerHasFile = formData.homepageBannerFiles?.length > 0;
        const cardHasFile = formData.industryCardFiles?.length > 0;

        const newErrors = {};
        if (!bannerHasFile) {
            newErrors.homepageBanner = t("industries.homepageBannerRequired") || "Homepage Banner Image is required";
        }
        if (!cardHasFile) {
            newErrors.industryCard = t("industries.industryCardRequired") || "Industry Card Image is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            await onSave({
                title: formData.title.trim(),
                i18nTitle: { ...(formData.i18nTitle || {}), en: formData.title.trim(), ar: String(formData.i18nTitle?.ar || "").trim() },
                order: formData.order === "" ? null : Number(formData.order),
                status: formData.status,
                short_description: formData.short_description.trim(),
                i18nShortDescription: { ...(formData.i18nShortDescription || {}), en: formData.i18nShortDescription?.en ?? formData.short_description.trim(), ar: formData.i18nShortDescription?.ar || "" },
                overview: formData.overview,
                full_description: formData.full_description,
                i18nFullDescription: { ...(formData.i18nFullDescription || {}), en: formData.i18nFullDescription?.en ?? formData.full_description, ar: formData.i18nFullDescription?.ar || "" },
                relatedIndustryIds: formData.relatedIndustryIds,
                description: formData.short_description.trim(),
                companies: formData.companies,
                value_chain_mapping: formData.value_chain_mapping,
                value_chain_stages: formData.value_chain_stages,
                homepageBannerFiles: formData.homepageBannerFiles,
                coverFiles: formData.homepageBannerFiles,
                iconFiles: formData.iconFiles,
                industryCardFiles: formData.industryCardFiles,
                homepageBannerPath: formData.homepageBannerFiles?.[0]?.file ? null : (formData.homepageBannerPath || industry?.homepageBannerPath || industry?.coverPath || null),
                industryCardPath: formData.industryCardFiles?.[0]?.file ? null : (formData.industryCardPath || industry?.industryCardPath || null),
                iconPath: formData.iconFiles?.[0]?.file ? null : (formData.iconPath || industry?.iconPath || null),
            });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const shortCount = formData.short_description.length;

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
                                {industry ? t("industries.edit") : t("industries.addTitle")}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title={t("industries.content")}>
                                        <div className="row">
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    {t("industries.name")} <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    maxLength={INDUSTRY_NAME_MAX}
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    dir={textDir}
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder={t("industries.namePh")}
                                                />
                                                <label className="form-label mt-2">{t("pages.fields.ar") || "Arabic name"} <span className="text-danger">*</span></label>
                                                <input type="text" dir="rtl" className="form-control" maxLength={INDUSTRY_NAME_MAX} required value={formData.i18nTitle?.ar || ""} onChange={(e) => setFormData((prev) => ({ ...prev, i18nTitle: { ...(prev.i18nTitle || {}), en: prev.title, ar: e.target.value } }))} />
                                                <label className="form-label mt-2">{t("industries.coverVideo")}</label>
                                                <input type="url" className="form-control" dir="ltr" maxLength={500} value={formData.cover_video_url || ""} onChange={(e) => setFormData((prev) => ({ ...prev, cover_video_url: e.target.value }))} placeholder="https://youtu.be/..." />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">{t("companies.displayOrder")}</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    name="order"
                                                    dir="ltr"
                                                    value={formData.order}
                                                    onChange={handleChange}
                                                    placeholder="1"
                                                    required
                                                />
                                            </div>
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
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">{t("industries.short")}</label>
                                                    <small className={`fsz-11 ${shortCount >= SHORT_DESC_MAX ? "text-danger" : "text-muted"}`}>
                                                        {shortCount}/{SHORT_DESC_MAX}
                                                    </small>
                                                </div>
                                                <div className="row g-2">
                                                    <div className="col-md-6"><label className="fsz-11 text-muted">EN</label><textarea className="form-control" name="short_description" rows={3} maxLength={SHORT_DESC_MAX} dir="ltr" value={formData.i18nShortDescription?.en ?? formData.short_description} onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value, i18nShortDescription: { ...(prev.i18nShortDescription || {}), en: e.target.value } }))} placeholder={t("industries.shortPh")} /></div>
                                                    <div className="col-md-6"><label className="fsz-11 text-muted">AR</label><textarea className="form-control" rows={3} maxLength={SHORT_DESC_MAX} dir="rtl" value={formData.i18nShortDescription?.ar || ""} onChange={(e) => setFormData((prev) => ({ ...prev, i18nShortDescription: { ...(prev.i18nShortDescription || {}), en: prev.short_description, ar: e.target.value } }))} /></div>
                                                </div>
                                                <small className="text-muted fsz-11">{t("industries.shortHint", { max: SHORT_DESC_MAX })}</small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">{t("industries.full")}</label>
                                                <div className="row g-2">{["en", "ar"].map((locale) => <div className="col-md-6" key={locale}>
                                                    <label className="fsz-11 text-muted">{locale.toUpperCase()}</label>
                                                    <textarea className="form-control" rows={5} maxLength={FULL_DESC_MAX} dir={locale === "ar" ? "rtl" : "ltr"} value={formData.i18nFullDescription?.[locale] ?? (locale === "en" ? formData.full_description : "")} onChange={(e) => setFormData((prev) => ({ ...prev, full_description: locale === "en" ? e.target.value : prev.full_description, i18nFullDescription: { ...(prev.i18nFullDescription || {}), [locale]: e.target.value } }))} />
                                                </div>)}</div>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <h6 className="fsz-13 fw-600">{t("industries.overview")}</h6>
                                                {["title", "firstDescription", "secondDescription"].map(key => <div className="mb-3" key={key}>
                                                    <label className="form-label">{t(`industries.overview.${key}`)}</label>
                                                    <div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}>
                                                        <label className="fsz-11 text-muted" htmlFor={`industry-overview-${key}-${lang}`}>{lang.toUpperCase()}</label>
                                                        {key === "title" ? <input id={`industry-overview-${key}-${lang}`} className="form-control" maxLength={2000} dir={lang === "ar" ? "rtl" : "ltr"} value={formData.overview?.[key]?.[lang] || ""} onChange={e => setFormData(prev => ({ ...prev, overview: { ...prev.overview, [key]: { ...prev.overview[key], [lang]: e.target.value } } }))} /> : <textarea id={`industry-overview-${key}-${lang}`} className="form-control" rows={3} maxLength={2000} dir={lang === "ar" ? "rtl" : "ltr"} value={formData.overview?.[key]?.[lang] || ""} onChange={e => setFormData(prev => ({ ...prev, overview: { ...prev.overview, [key]: { ...prev.overview[key], [lang]: e.target.value } } }))} />}
                                                    </div>)}</div>
                                                </div>)}
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        title={t("industries.images")}
                                        hint={t("industries.imagesHint")}
                                    >
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {t("industries.homepageBanner")} <span className="text-danger">*</span>
                                                </label>
                                                <FileUpload
                                                    files={formData.homepageBannerFiles}
                                                    onFilesChange={(files) => {
                                                        setFormData((prev) => ({ ...prev, homepageBannerFiles: files }));
                                                        if (errors.homepageBanner) {
                                                            setErrors((prev) => ({ ...prev, homepageBanner: null }));
                                                        }
                                                    }}
                                                    maxFiles={1}
                                                    accept={INDUSTRY_IMAGE_ACCEPT}
                                                    title={t("industries.uploadHomepageBanner")}
                                                    hint={t("industries.homepageBannerHint")}
                                                />
                                                {errors.homepageBanner && (
                                                    <div className="text-danger fsz-12 mt-1">{errors.homepageBanner}</div>
                                                )}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {t("industries.industryCard")} <span className="text-danger">*</span>
                                                </label>
                                                <FileUpload
                                                    files={formData.industryCardFiles}
                                                    onFilesChange={(files) => {
                                                        setFormData((prev) => ({ ...prev, industryCardFiles: files }));
                                                        if (errors.industryCard) {
                                                            setErrors((prev) => ({ ...prev, industryCard: null }));
                                                        }
                                                    }}
                                                    maxFiles={1}
                                                    accept={INDUSTRY_IMAGE_ACCEPT}
                                                    title={t("industries.uploadIndustryCard")}
                                                    hint={t("industries.industryCardHint")}
                                                />
                                                {errors.industryCard && (
                                                    <div className="text-danger fsz-12 mt-1">{errors.industryCard}</div>
                                                )}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">{t("industries.icon")}</label>
                                                <FileUpload files={formData.iconFiles} onFilesChange={(files) => setFormData((prev) => ({ ...prev, iconFiles: files, iconPath: files[0]?.file ? null : prev.iconPath }))} maxFiles={1} accept={INDUSTRY_IMAGE_ACCEPT} title={t("industries.uploadIcon")} hint={t("industries.imageHint")} />
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        title={t("industries.companies")}
                                        hint={t("companies.industriesHint")}
                                    >
                                        <div className="d-flex flex-wrap gap-2">
                                            {allCompanies.map((company) => {
                                                const selected = formData.companies.includes(company.code);
                                                return (
                                                    <button
                                                        key={company.id}
                                                        type="button"
                                                        className={`btn fsz-12 py-2 px-3 border ${
                                                            selected
                                                                ? "btn-dark"
                                                                : "btn-light"
                                                        }`}
                                                        onClick={() => toggleCompany(company.code)}
                                                        title={text(company.i18nTitle, company.title)}
                                                    >
                                                        {company.image && (
                                                            <img
                                                                src={publicPath(company.image)}
                                                                alt=""
                                                                className="me-2 rounded-circle"
                                                                style={{ width: 18, height: 18, objectFit: "contain" }}
                                                            />
                                                        )}
                                                        {company.code}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {formData.companies.length > 0 && (
                                            <div className="mt-3 text-muted fsz-12">
                                                {t("industries.companiesSelected", { count: formData.companies.length })}
                                            </div>
                                        )}
                                    </Section>

                                    <Section title={t("industries.relatedSectors")}>
                                        <div className="row">{relatedIndustryOptions.map((item) => <div className="col-md-4" key={item.id}><label className="form-check border rounded p-2 mb-2"><input className="form-check-input" type="checkbox" checked={formData.relatedIndustryIds.includes(item.id)} onChange={() => setFormData((prev) => ({ ...prev, relatedIndustryIds: prev.relatedIndustryIds.includes(item.id) ? prev.relatedIndustryIds.filter((id) => id !== item.id) : [...prev.relatedIndustryIds, item.id] }))} /><span className="form-check-label ms-2">{text(item.i18nTitle, item.title || item.slug)}</span></label></div>)}</div>
                                    </Section>

                                    <Section title={t("industries.valueChain")} hint={t("industries.valueChainHint")}>
                                      {valueChainStages.length === 0 ? <p className="text-muted fsz-12">{t("industries.noValueChainStages") || "Add stages using Value Chain Stages."}</p> : <div className="row">{valueChainStages.map((stage) => <div className="col-md-6" key={stage.id}><label className="form-check border rounded p-3 mb-2"><input className="form-check-input" type="checkbox" checked={formData.value_chain_stages.includes(stage.id)} onChange={() => setFormData((prev) => ({ ...prev, value_chain_stages: prev.value_chain_stages.includes(stage.id) ? prev.value_chain_stages.filter((id) => id !== stage.id) : [...prev.value_chain_stages, stage.id] }))} /><span className="form-check-label ms-2">{text(stage.name, stage.name?.en || "")}</span></label></div>)}</div>}
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
                                    {t("common.cancel")}
                                </button>
                                <button type="submit" className="butn-st2" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t("common.saving")}
                                        </>
                                    ) : industry ? (
                                        t("industries.update")
                                    ) : (
                                        t("industries.add")
                                    )}
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
