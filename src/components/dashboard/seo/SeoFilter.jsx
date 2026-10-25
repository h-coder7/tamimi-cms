"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { SEO_HEALTH } from "@/hooks/useSeo";
import { useI18n } from "@/hooks/useI18n";

export default function SeoFilter({
    search,
    onSearchChange,
    healthFilter,
    onHealthChange,
    onReset,
}) {
    const { t, isRtl, statusText } = useI18n();

    const healthOptions = useMemo(
        () => SEO_HEALTH.map((health) => ({ value: health, label: statusText(health) })),
        [statusText]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-7">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("seo.searchPh")}
                        value={search}
                        dir={isRtl ? "rtl" : "ltr"}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("seo.health")}</label>
                    <SearchableSelect
                        options={healthOptions}
                        value={healthFilter}
                        onChange={onHealthChange}
                        placeholder={t("common.all")}
                        className="form-select-sm fsz-12"
                        instanceId="seo-health-filter"
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
