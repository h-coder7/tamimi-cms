"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { SEO_HEALTH } from "@/hooks/useSeo";

export default function SeoFilter({
    search,
    onSearchChange,
    healthFilter,
    onHealthChange,
    onReset,
}) {
    const healthOptions = useMemo(
        () => SEO_HEALTH.map((health) => ({ value: health, label: health })),
        []
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-7">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Page"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">Health</label>
                    <SearchableSelect
                        options={healthOptions}
                        value={healthFilter}
                        onChange={onHealthChange}
                        placeholder="All"
                        className="form-select-sm fsz-12"
                        instanceId="seo-health-filter"
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
