"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { JOB_STATUSES } from "@/hooks/useJobs";

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
    const statusOptions = useMemo(
        () => JOB_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Job title"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">City</label>
                    <SearchableSelect
                        options={cityOptions}
                        value={cityFilter}
                        onChange={onCityChange}
                        placeholder="All cities"
                        className="form-select-sm fsz-12"
                        instanceId="job-city-filter"
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Company</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder="All companies"
                        className="form-select-sm fsz-12"
                        instanceId="job-company-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">Status</label>
                    <SearchableSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                        placeholder="All"
                        className="form-select-sm fsz-12"
                        instanceId="job-status-filter"
                    />
                </div>
                <div className="col-lg-1 d-flex justify-content-lg-end">
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
        </div>
    );
}
