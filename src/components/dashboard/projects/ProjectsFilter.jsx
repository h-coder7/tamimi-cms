"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";

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
    const featuredOptions = useMemo(() => [
        { value: "yes", label: "Featured" },
        { value: "no", label: "Not featured" },
    ], []);

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Project or client"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">Company</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder="All companies"
                        className="form-select-sm fsz-12"
                        instanceId="project-company-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">Industry</label>
                    <SearchableSelect
                        options={industryOptions}
                        value={industryFilter}
                        onChange={onIndustryChange}
                        placeholder="All industries"
                        className="form-select-sm fsz-12"
                        instanceId="project-industry-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">Year</label>
                    <SearchableSelect
                        options={yearOptions}
                        value={yearFilter}
                        onChange={onYearChange}
                        placeholder="All years"
                        className="form-select-sm fsz-12"
                        instanceId="project-year-filter"
                    />
                </div>
                <div className="col-lg-2">
                    <label className="form-label fsz-12 text-muted mb-1">Featured</label>
                    <SearchableSelect
                        options={featuredOptions}
                        value={featuredFilter}
                        onChange={onFeaturedChange}
                        placeholder="All"
                        className="form-select-sm fsz-12"
                        instanceId="project-featured-filter"
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
