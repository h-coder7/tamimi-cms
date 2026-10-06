"use client";

import { useMemo, useState } from "react";
import SearchableSelect from "../../shared/SearchableSelect";
import { publicPath } from "@/utils/publicPath";

export default function ClientsPartnersGrid({
    data = [],
    onEdit,
    onDelete,
}) {
    const [search, setSearch] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");

    const industryOptions = useMemo(() => {
        const industries = [...new Set(data.map((item) => item.industry).filter(Boolean))];
        return industries.map((industry) => ({ value: industry, label: industry }));
    }, [data]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch = !q || String(item.title || "").toLowerCase().includes(q);
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
                        <label className="form-label fsz-12 text-muted mb-1">Search</label>
                        <input
                            className="form-control"
                            placeholder="Name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="col-lg-6">
                        <label className="form-label fsz-12 text-muted mb-1">Industry</label>
                        <SearchableSelect
                            options={industryOptions}
                            value={industryFilter}
                            onChange={setIndustryFilter}
                            placeholder="All industries"
                            className="form-select-sm fsz-12"
                            instanceId="clients-partners-industry-filter"
                        />
                    </div>
                    <div className="col-lg-1 d-flex justify-content-lg-end">
                        <button
                            type="button"
                            className="btn bg-white icon-45 p-0 border-0 mb-1 w-100"
                            title="Clear All Filters"
                            onClick={resetFilters}
                        >
                            <i className="fal fa-filter-slash fsz-12 text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-5 text-muted fsz-13">
                    No logos found
                </div>
            ) : (
                <div className="row g-3 partners-logo-grid">
                    {filtered.map((item) => (
                        <div className="col-12 col-sm-6 col-xl-3" key={item.id}>
                            <article className="partner-logo-card h-100">
                                <div className="partner-logo-card__actions">
                                    <button
                                        type="button"
                                        className="partner-logo-card__btn"
                                        onClick={() => onEdit?.(item.id)}
                                        title="Edit"
                                    >
                                        <i className="fal fa-pen"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="partner-logo-card__btn partner-logo-card__btn--danger"
                                        onClick={() => onDelete?.(item.id)}
                                        title="Delete"
                                    >
                                        <i className="fal fa-trash"></i>
                                    </button>
                                </div>

                                <div className="partner-logo-card__logo">
                                    {item.logo ? (
                                        <img
                                            src={publicPath(item.logo)}
                                            alt={`${item.title} logo`}
                                        />
                                    ) : (
                                        <span className="partner-logo-card__placeholder">Logo</span>
                                    )}
                                </div>

                                <div className="partner-logo-card__meta">
                                    <h6 className="partner-logo-card__title">{item.title}</h6>
                                    <p className="partner-logo-card__sub">
                                        {item.industry || "—"}
                                        <span>·</span>
                                        {item.type || "Client"}
                                    </p>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
