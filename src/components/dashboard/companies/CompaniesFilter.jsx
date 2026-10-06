"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";

export default function CompaniesFilter({
    search,
    onSearchChange,
    typeFilter,
    onTypeChange,
    industryFilter,
    onIndustryChange,
    industryOptions = [],
    onReset,
}) {
    const typeOptions = useMemo(() => [
        { value: "Subsidiary", label: "Subsidiary" },
        { value: "Joint Venture", label: "Joint Venture" },
    ], []);

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Company name or code"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Type</label>
                    <SearchableSelect
                        options={typeOptions}
                        value={typeFilter}
                        onChange={onTypeChange}
                        placeholder="All types"
                        className="form-select-sm fsz-12"
                        instanceId="company-type-filter"
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">Industry</label>
                    <SearchableSelect
                        options={industryOptions}
                        value={industryFilter}
                        onChange={onIndustryChange}
                        placeholder="All industries"
                        className="form-select-sm fsz-12"
                        instanceId="company-industry-filter"
                    />
                </div>
                <div className="col-lg-1 d-flex justify-content-lg-end">
                    <button
                        type="button"
                        className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                        title="Clear All Filters"
                        onClick={onReset}
                    >
                        <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
