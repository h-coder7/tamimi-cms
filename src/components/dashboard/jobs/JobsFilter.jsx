"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { JOB_STATUSES } from "@/hooks/useJobs";
import { useI18n } from "@/hooks/useI18n";

function localizeCompanyOptions(options, t) {
    return options.map((opt) => {
        if (opt.value === "group" || opt.value === "TEG" || opt.label === "Tamimi Energy Group") {
            return { ...opt, label: t("status.group") };
        }
        return opt;
    });
}

export default function JobsFilter({
    search,
    onSearchChange,
    cityFilter,
    onCityChange,
    companyFilter,
    onCompanyChange,
    statusFilter,
    onStatusChange,
    cityOptions = [],
    companyOptions = [],
    onReset,
}) {
    const { t, statusText } = useI18n();

    const statusOptions = useMemo(
        () => JOB_STATUSES.map((status) => ({ value: status, label: statusText(status) })),
        [statusText]
    );

    const localizedCities = useMemo(
        () => cityOptions.map((opt) => ({ ...opt, label: statusText(opt.value) })),
        [cityOptions, statusText]
    );

    const localizedCompanies = useMemo(
        () => localizeCompanyOptions(companyOptions, t),
        [companyOptions, t]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("jobs.searchPh")}
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.city")}</label>
                    <SearchableSelect
                        options={localizedCities}
                        value={cityFilter}
                        onChange={onCityChange}
                        placeholder={t("jobs.allCities")}
                        className="form-select-sm fsz-12"
                        instanceId="job-city-filter"
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.company")}</label>
                    <SearchableSelect
                        options={localizedCompanies}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder={t("jobs.allCompanies")}
                        className="form-select-sm fsz-12"
                        instanceId="job-company-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.status")}</label>
                    <SearchableSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                        placeholder={t("jobs.allStatuses")}
                        className="form-select-sm fsz-12"
                        instanceId="job-status-filter"
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
