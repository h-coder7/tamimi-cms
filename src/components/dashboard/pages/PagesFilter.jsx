"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { PAGE_STATUSES } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";

export default function PagesFilter({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    onReset,
}) {
    const { t, statusText } = useI18n();
    const statusOptions = useMemo(
        () => PAGE_STATUSES.map((status) => ({ value: status, label: statusText(status) })),
        [statusText]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-7">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("pages.searchPh")}
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.status")}</label>
                    <SearchableSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                        placeholder={t("common.all")}
                        className="form-select-sm fsz-12"
                        instanceId="cms-page-status-filter"
                    />
                </div>
                <div className="col-lg-1 d-flex justify-content-lg-end">
                    <button
                        type="button"
                        className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                        title={t("common.clearFilters")}
                        onClick={onReset}
                    >
                        <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
