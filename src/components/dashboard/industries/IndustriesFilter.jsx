"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { useI18n } from "@/hooks/useI18n";

export default function IndustriesFilter({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    onReset,
}) {
    const { t, isRtl, statusText } = useI18n();
    const statusOptions = useMemo(() => [
        { value: "Draft", label: statusText("Draft") },
        { value: "Published", label: statusText("Published") },
    ], [statusText]);

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-6">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("industries.searchPh")}
                        value={search}
                        dir={isRtl ? "rtl" : "ltr"}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-5">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.status")}</label>
                    <SearchableSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusChange}
                        placeholder={t("common.all")}
                        className="form-select-sm fsz-12"
                        instanceId="industry-status-filter"
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
