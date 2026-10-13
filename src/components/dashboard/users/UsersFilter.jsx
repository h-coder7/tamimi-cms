"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { USER_STATUSES } from "@/hooks/useUsers";

export default function UsersFilter({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    onReset,
}) {
    const statusOptions = useMemo(
        () => USER_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-8">
                    <label className="form-label fsz-12 text-muted mb-1">Search</label>
                    <input
                        className="form-control"
                        placeholder="Name or email"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
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
                        instanceId="user-status-filter"
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
