"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { useI18n } from "@/hooks/useI18n";

export const DATE_FILTER_OPTIONS = [
    { value: "", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
];

const DATE_LABEL_KEYS = {
    "": "applications.allTime",
    "7d": "dateRange.last7",
    "30d": "dateRange.last30",
    "90d": "applications.last90",
};

export default function ApplicationsFilter({
    search,
    onSearchChange,
    jobFilter,
    onJobChange,
    dateFilter,
    onDateChange,
    jobOptions = [],
    onReset,
}) {
    const { t } = useI18n();

    const dateOptions = useMemo(
        () =>
            DATE_FILTER_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(DATE_LABEL_KEYS[opt.value] || "applications.allTime"),
            })),
        [t]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("applications.searchPh")}
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("applications.job")}</label>
                    <SearchableSelect
                        options={jobOptions}
                        value={jobFilter}
                        onChange={onJobChange}
                        placeholder={t("applications.allJobs")}
                        className="form-select-sm fsz-12"
                        instanceId="application-job-filter"
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.date")}</label>
                    <SearchableSelect
                        options={dateOptions}
                        value={dateFilter}
                        onChange={onDateChange}
                        placeholder={t("applications.allTime")}
                        className="form-select-sm fsz-12"
                        instanceId="application-date-filter"
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
