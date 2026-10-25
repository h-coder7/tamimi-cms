"use client";

import { useMemo, useState } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { publicPath } from "@/utils/publicPath";
import { useIndustries } from "@/hooks/useIndustries";
import { buildIndustryFilterOptions } from "@/lib/industryOptions";
import { useI18n } from "@/hooks/useI18n";

export default function ClientsPartnersGrid({
    data = [],
    onEdit,
    onDelete,
}) {
    const { t, isRtl, statusText, text } = useI18n();
    const [search, setSearch] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const { data: industries = [] } = useIndustries();

    const industryOptions = useMemo(
        () => buildIndustryFilterOptions(industries).map((opt) => {
            const industry = industries.find((item) => item.title === opt.value || item.id === opt.value);
            return {
                ...opt,
                label: industry ? text(industry.i18nTitle, opt.label) : opt.label,
            };
        }),
        [industries, text]
    );

    const industryLabel = (name) => {
        const match = industries.find((item) => item.title === name);
        return match ? text(match.i18nTitle, name) : name;
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const titleBlob = [item.title, item.i18nTitle?.en, item.i18nTitle?.ar]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchesSearch = !q || titleBlob.includes(q);
            const matchesIndustry = !industryFilter || item.industry === industryFilter;
            return matchesSearch && matchesIndustry;
        });
    }, [data, search, industryFilter]);

    const resetFilters = () => {
        setSearch("");
        setIndustryFilter("");
    };

    return (
        <div className="clients-partners-grid pb-5">
            <div className="search mt-4 border mb-4 radius-15 p-4">
                <div className="row g-3 align-items-end">
                    <div className="col-lg-5">
                        <label className="form-label fsz-12 text-muted mb-1">{t("common.search")}</label>
                        <input
                            className="form-control"
                            placeholder={t("clients.name")}
                            value={search}
                            dir={isRtl ? "rtl" : "ltr"}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="col-lg-6">
                        <label className="form-label fsz-12 text-muted mb-1">{t("common.industry")}</label>
                        <SearchableSelect
                            options={industryOptions}
                            value={industryFilter}
                            onChange={setIndustryFilter}
                            placeholder={t("companies.allIndustries")}
                            className="form-select-sm fsz-12"
                            instanceId="clients-partners-industry-filter"
                        />
                    </div>
                    <div className="col-lg-1 d-flex justify-content-lg-end">
                        <button
                            type="button"
                            className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                            title={t("common.clearFilters")}
                            onClick={resetFilters}
                        >
                            <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-5 text-muted fsz-13">
                    {t("clients.empty")}
                </div>
            ) : (
                <div className="row g-3 partners-logo-grid">
                    {filtered.map((item) => {
                        const name = text(item.i18nTitle, item.title);
                        return (
                        <div className="col-12 col-sm-6 col-xl-3" key={item.id}>
                            <article className="partner-logo-card h-100">
                                <div className="partner-logo-card__actions">
                                    <button
                                        type="button"
                                        className="partner-logo-card__btn"
                                        onClick={() => onEdit?.(item.id)}
                                        title={t("common.edit")}
                                    >
                                        <i className="fal fa-pen"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="partner-logo-card__btn partner-logo-card__btn--danger"
                                        onClick={() => onDelete?.(item.id)}
                                        title={t("common.delete")}
                                    >
                                        <i className="fal fa-trash"></i>
                                    </button>
                                </div>

                                <div className="partner-logo-card__logo">
                                    {item.logo ? (
                                        <img
                                            src={publicPath(item.logo)}
                                            alt={t("clients.logoAlt", { name })}
                                        />
                                    ) : (
                                        <span className="partner-logo-card__placeholder">{t("clients.logo")}</span>
                                    )}
                                </div>

                                <div className="partner-logo-card__meta">
                                    <h6 className="partner-logo-card__title">{name}</h6>
                                    <p className="partner-logo-card__sub">
                                        {item.industry ? industryLabel(item.industry) : "—"}
                                        <span>·</span>
                                        {statusText(item.type || "Client")}
                                    </p>
                                </div>
                            </article>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
