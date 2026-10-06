"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { CERTIFICATE_TYPES } from "@/hooks/useCertificates";

export default function CertificatesFilter({
    search,
    onSearchChange,
    typeFilter,
    onTypeChange,
    companyFilter,
    onCompanyChange,
    companyOptions = [],
    onReset,
}) {
    const typeOptions = useMemo(
        () => CERTIFICATE_TYPES.map((type) => ({ value: type, label: type })),
        []
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Certificate name"
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
                        instanceId="certificate-type-filter"
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">Holder</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder="Group"
                        className="form-select-sm fsz-12"
                        instanceId="certificate-company-filter"
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
