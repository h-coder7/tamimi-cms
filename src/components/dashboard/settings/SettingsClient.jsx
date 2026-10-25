"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useI18n } from "@/hooks/useI18n";

const emptyBranch = () => ({
    id: Date.now(),
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
});

export default function SettingsClient() {
    const { t, isRtl } = useI18n();
    const dir = isRtl ? "rtl" : "ltr";
    const { data: settings, isLoading } = useSettings();
    const updateSettingsMutation = useUpdateSettings();

    const [formData, setFormData] = useState(null);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const tabs = [
        { id: "general", label: t("settings.general"), icon: "fal fa-building" },
        { id: "branches", label: t("settings.branches"), icon: "fal fa-map-marker-alt" },
        { id: "social", label: t("settings.social"), icon: "fal fa-share-alt" },
        { id: "recipients", label: t("settings.recipients"), icon: "fal fa-inbox" },
        { id: "header-footer", label: t("settings.headerFooter"), icon: "fal fa-browser" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBranchChange = (id, field, value) => {
        setFormData((prev) => ({
            ...prev,
            branches: (prev.branches || []).map((branch) =>
                branch.id === id ? { ...branch, [field]: value } : branch
            ),
        }));
    };

    const addBranch = () => {
        setFormData((prev) => ({
            ...prev,
            branches: [...(prev.branches || []), emptyBranch()],
        }));
    };

    const removeBranch = (id) => {
        setFormData((prev) => ({
            ...prev,
            branches: (prev.branches || []).filter((branch) => branch.id !== id),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSettingsMutation.mutateAsync(formData);
    };

    if (isLoading || !formData) {
        return (
            <div className="text-center py-5 mt-5">
                <div className="spinner-border" role="status"></div>
                <p className="mt-3 text-muted">{t("settings.loading")}</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader title={t("settings.title")} icon="fal fa-gear" />

            <div className="row mt-4">
                <div className="col-lg-12">
                    <ul className="nav nav-pills settings-nav-pills mb-4" id="settingsTabs" role="tablist">
                        {tabs.map((tab) => (
                            <li className="nav-item" role="presentation" key={tab.id}>
                                <button
                                    className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                    role="tab"
                                >
                                    <i className={`${tab.icon} me-2`}></i>
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="table-content p-4 mt-0">
                        <form onSubmit={handleSubmit}>
                            {activeTab === "general" && (
                                <div>
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-building fsz-14"></i>
                                        {t("common.company")}
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.companyName")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir={dir}
                                                name="company_name"
                                                required
                                                value={formData.company_name || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.parent")}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir={dir}
                                                name="parent_company"
                                                value={formData.parent_company || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.headOffice")} <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                dir={dir}
                                                name="head_office_address"
                                                rows={3}
                                                required
                                                value={formData.head_office_address || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.poBox")}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir="ltr"
                                                name="po_box"
                                                value={formData.po_box || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.phone")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir="ltr"
                                                name="phone"
                                                required
                                                value={formData.phone || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.generalEmail")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                dir="ltr"
                                                name="general_email"
                                                required
                                                value={formData.general_email || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.maps")}</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                dir="ltr"
                                                name="google_maps_link"
                                                placeholder={t("settings.mapsPh")}
                                                value={formData.google_maps_link || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "branches" && (
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <h6 className="mb-0 cr-blue d-flex align-items-center gap-2">
                                            <i className="fal fa-map-marker-alt fsz-14"></i>
                                            {t("settings.branches")}
                                        </h6>
                                        <button
                                            type="button"
                                            className="alert alert-success rounded-pill py-2 px-3 fsz-12 border-0 mb-0"
                                            onClick={addBranch}
                                        >
                                            <i className="fal fa-plus"></i>
                                            <span className="txt ms-2">{t("settings.addBranch")}</span>
                                        </button>
                                    </div>

                                    {(formData.branches || []).length === 0 ? (
                                        <div className="text-center py-5 text-muted fsz-13">
                                            {t("settings.noBranches")}
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-4">
                                            {(formData.branches || []).map((branch, index) => (
                                                <div key={branch.id} className="border radius-15 p-4">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <h6 className="fsz-13 fw-600 mb-0">{t("settings.branchN", { n: index + 1 })}</h6>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeBranch(branch.id)}
                                                            title={t("settings.removeBranch")}
                                                        >
                                                            <i className="fal fa-trash"></i>
                                                        </button>
                                                    </div>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label fsz-12 text-muted">{t("common.name")}</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                dir={dir}
                                                                value={branch.name || ""}
                                                                onChange={(e) =>
                                                                    handleBranchChange(branch.id, "name", e.target.value)
                                                                }
                                                                placeholder={t("settings.branchNamePh")}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fsz-12 text-muted">{t("common.city")}</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                dir={dir}
                                                                value={branch.city || ""}
                                                                onChange={(e) =>
                                                                    handleBranchChange(branch.id, "city", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="form-label fsz-12 text-muted">{t("common.address")}</label>
                                                            <textarea
                                                                className="form-control"
                                                                dir={dir}
                                                                rows={2}
                                                                value={branch.address || ""}
                                                                onChange={(e) =>
                                                                    handleBranchChange(branch.id, "address", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fsz-12 text-muted">{t("settings.phone")}</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                dir="ltr"
                                                                value={branch.phone || ""}
                                                                onChange={(e) =>
                                                                    handleBranchChange(branch.id, "phone", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fsz-12 text-muted">{t("settings.email")}</label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                dir="ltr"
                                                                value={branch.email || ""}
                                                                onChange={(e) =>
                                                                    handleBranchChange(branch.id, "email", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "social" && (
                                <div>
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-share-alt fsz-14"></i>
                                        {t("settings.social")}
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fsz-12 text-muted">{t("settings.linkedin")}</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                dir="ltr"
                                                name="linkedin"
                                                value={formData.linkedin || ""}
                                                onChange={handleChange}
                                                placeholder={t("settings.linkedinPh")}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.x")}</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                dir="ltr"
                                                name="twitter"
                                                value={formData.twitter || ""}
                                                onChange={handleChange}
                                                placeholder={t("settings.optional")}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.youtube")}</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                dir="ltr"
                                                name="youtube"
                                                value={formData.youtube || ""}
                                                onChange={handleChange}
                                                placeholder={t("settings.optional")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "recipients" && (
                                <div>
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-inbox fsz-14"></i>
                                        {t("settings.recipients")}
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.contactForm")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir="ltr"
                                                name="contact_form_email"
                                                required
                                                value={formData.contact_form_email || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.inquiryForm")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir="ltr"
                                                name="inquiry_form_email"
                                                required
                                                value={formData.inquiry_form_email || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fsz-12 text-muted">
                                                {t("settings.careersApps")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir="ltr"
                                                name="careers_email"
                                                required
                                                value={formData.careers_email || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <p className="fsz-12 text-muted mb-0">
                                                {t("settings.inquiryNote")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "header-footer" && (
                                <div>
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-browser fsz-14"></i>
                                        {t("settings.headerFooter")}
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.headerCta")}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir={dir}
                                                name="header_cta_label"
                                                value={formData.header_cta_label || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">{t("settings.footer")}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                dir={dir}
                                                name="footer_copyright"
                                                value={formData.footer_copyright || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <p className="fsz-12 text-muted mb-0">
                                                {t("settings.menuNote")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 mb-4 text-center">
                                <button
                                    type="submit"
                                    className="butn-st2 d-inline-flex align-items-center gap-2 after-none"
                                    disabled={updateSettingsMutation.isPending}
                                >
                                    <i className="fal fa-check-circle"></i>
                                    <span>{t("settings.save")}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
