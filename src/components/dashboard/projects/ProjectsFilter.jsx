"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { useI18n } from "@/hooks/useI18n";

export default function ProjectsFilter({
    search,
    onSearchChange,
    companyFilter,
    onCompanyChange,
    industryFilter,
    onIndustryChange,
    yearFilter,
    onYearChange,
    featuredFilter,
    onFeaturedChange,
    companyOptions = [],
    industryOptions = [],
    yearOptions = [],
    onReset,
}) {
    const { t, isRtl, statusText } = useI18n();
    const featuredOptions = useMemo(() => [
        { value: "yes", label: statusText("Featured") },
        { value: "no", label: t("projects.notFeatured") },
    ], [statusText, t]);

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("projects.searchPh")}
                        value={search}
                        dir={isRtl ? "rtl" : "ltr"}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.company")}</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder={t("projects.allCompanies")}
                        className="form-select-sm fsz-12"
                        instanceId="project-company-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.industry")}</label>
                    <SearchableSelect
                        options={industryOptions}
                        value={industryFilter}
                        onChange={onIndustryChange}
                        placeholder={t("projects.allIndustries")}
                        className="form-select-sm fsz-12"
                        instanceId="project-industry-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.year")}</label>
                    <SearchableSelect
                        options={yearOptions}
                        value={yearFilter}
                        onChange={onYearChange}
                        placeholder={t("projects.allYears")}
                        className="form-select-sm fsz-12"
                        instanceId="project-year-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.featured")}</label>
                    <SearchableSelect
                        options={featuredOptions}
                        value={featuredFilter}
                        onChange={onFeaturedChange}
                        placeholder={t("common.all")}
                        className="form-select-sm fsz-12"
                        instanceId="project-featured-filter"
                    />
                </div>
                <div className="col-lg-1 d-flex justify-content-lg-end">
                    <button
                        className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                        title={t("common.clearFilters")}
                        onClick={onReset}
                        type="button"
                    >
                        <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
