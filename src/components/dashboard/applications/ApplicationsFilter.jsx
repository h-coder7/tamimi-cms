"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";

export const DATE_FILTER_OPTIONS = [
    { value: "", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
];

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
    const dateOptions = useMemo(() => DATE_FILTER_OPTIONS, []);

    return (
        <div className="row g-3 align-items-end mb-3">
            <div className="col-lg-4">
                <label className="form-label fsz-12 text-muted mb-1">Search</label>
                <input
                    className="form-control"
                    placeholder="Applicant name or email"
                    value={search}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                />
            </div>
            <div className="col-lg-3">
                <label className="form-label fsz-12 text-muted mb-1">Job</label>
                <SearchableSelect
                    options={jobOptions}
                    value={jobFilter}
                    onChange={onJobChange}
                    placeholder="All jobs"
                    className="form-select-sm fsz-12"
                    instanceId="application-job-filter"
                />
            </div>
            <div className="col-lg-3">
                <label className="form-label fsz-12 text-muted mb-1">Date</label>
                <SearchableSelect
                    options={dateOptions}
                    value={dateFilter}
                    onChange={onDateChange}
                    placeholder="All time"
                    className="form-select-sm fsz-12"
                    instanceId="application-date-filter"
                />
            </div>
            <div className="col-lg-2 d-flex justify-content-lg-end">
                <button
                    className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                    title="Clear All Filters"
                    onClick={onReset}
                    type="button"
                >
                    <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                </button>
            </div>
        </div>
    );
}
