"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { DOWNLOAD_TYPES } from "@/hooks/useDownloads";
import { useI18n } from "@/hooks/useI18n";

const TYPE_KEY = {
    "Company profile": "company_profile",
    Brochure: "brochure",
    Policy: "policy",
    Other: "other",
};

export default function DownloadsFilter({
    search,
    onSearchChange,
    typeFilter,
    onTypeChange,
    companyFilter,
    onCompanyChange,
    companyOptions = [],
    onReset,
}) {
    const { t, isRtl, statusText } = useI18n();

    const typeOptions = useMemo(
        () =>
            DOWNLOAD_TYPES.map((type) => ({
                value: type,
                label: statusText(TYPE_KEY[type] || type),
            })),
        [statusText]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("downloads.searchPh")}
                        value={search}
                        dir={isRtl ? "rtl" : "ltr"}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.type")}</label>
                    <SearchableSelect
                        options={typeOptions}
                        value={typeFilter}
                        onChange={onTypeChange}
                        placeholder={t("downloads.allTypes")}
                        className="form-select-sm fsz-12"
                        instanceId="download-type-filter"
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.company")}</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder={t("common.all")}
                        className="form-select-sm fsz-12"
                        instanceId="download-company-filter"
                    />
                </div>
                <div className="col-lg-1 d-flex justify-content-lg-end">
                    <button
                        type="button"
                        className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                        title={t("common.clearFilters")}
                        onClick={onReset}
                    >
                        <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
