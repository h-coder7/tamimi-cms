"use client";

import { useMemo } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { CERTIFICATE_TYPES } from "@/hooks/useCertificates";
import { useI18n } from "@/hooks/useI18n";

function localizeCompanyOptions(options, t) {
    return options.map((opt) => {
        if (opt.value === "group" || opt.value === "TEG" || opt.label === "Tamimi Energy Group") {
            return { ...opt, label: t("status.group") };
        }
        return opt;
    });
}

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
    const { t, statusText } = useI18n();

    const typeOptions = useMemo(
        () => CERTIFICATE_TYPES.map((type) => ({ value: type, label: statusText(type) })),
        [statusText]
    );

    const holderOptions = useMemo(
        () => localizeCompanyOptions(companyOptions, t),
        [companyOptions, t]
    );

    return (
        <div className="search mt-4 border mb-4 radius-15 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                    <input
                        className="form-control"
                        placeholder={t("certificates.searchPh")}
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                <div className="col-lg-3">
                    <label className="form-label fsz-12 text-muted mb-1">{t("common.type")}</label>
                    <SearchableSelect
                        options={typeOptions}
                        value={typeFilter}
                        onChange={onTypeChange}
                        placeholder={t("certificates.allTypes")}
                        className="form-select-sm fsz-12"
                        instanceId="certificate-type-filter"
                    />
                </div>
                <div className="col-lg-4">
                    <label className="form-label fsz-12 text-muted mb-1">{t("certificates.holder")}</label>
                    <SearchableSelect
                        options={holderOptions}
                        value={companyFilter}
                        onChange={onCompanyChange}
                        placeholder={t("certificates.allHolders")}
                        className="form-select-sm fsz-12"
                        instanceId="certificate-company-filter"
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
