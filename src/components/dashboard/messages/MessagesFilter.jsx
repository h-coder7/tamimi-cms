"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { MESSAGE_STATUSES } from "@/hooks/useMessages";

export default function MessagesFilter({
    search,
    onSearchChange,
    companyFilter,
    onCompanyChange,
    statusFilter,
    onStatusChange,
    companyOptions = [],
    onReset,
}) {
    const statusOptions = useMemo(
        () => MESSAGE_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-5">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Name, email or subject"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Target company</label>
                    <SearchableSelect
                        options={companyOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder="All"
                        className="form-select-sm fsz-12"
                        instanceId="message-company-filter"
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">Status</label>
                    <SearchableSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                        placeholder="All"
                        className="form-select-sm fsz-12"
                        instanceId="message-status-filter"
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
