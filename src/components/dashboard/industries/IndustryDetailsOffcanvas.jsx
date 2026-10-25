"use client";

import { useEffect, useState, useMemo } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { VALUE_CHAIN_STAGES } from "@/hooks/useIndustries";
import { publicPath } from "@/utils/publicPath";
import { useI18n } from "@/hooks/useI18n";

export default function IndustryDetailsOffcanvas({ show, industry, onClose }) {
    const { t, statusText, text } = useI18n();
    const { data: allCompanies = [] } = useCompanies();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const companiesByCode = useMemo(() => {
        const map = {};
        allCompanies.forEach((company) => {
            if (company.code) map[company.code] = company;
        });
        return map;
    }, [allCompanies]);

    if (!isMounted) return null;

    const companies = Array.isArray(industry?.companies) ? industry.companies : [];
    const mapping = industry?.value_chain_mapping || {};
    const stageLabel = (stage) => {
        const label = t(`valueChain.${stage}`);
        return label === `valueChain.${stage}` ? stage : label;
    };

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                id="industryDetailsOffcanvas"
                aria-labelledby="industryDetailsOffcanvasLabel"
                style={{ visibility: show ? "visible" : "hidden", width: "480px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16" id="industryDetailsOffcanvasLabel">
                        <i className="fal fa-industry me-2"></i> {t("industries.details")}
                    </h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        onClick={onClose}
                        aria-label={t("common.close")}
                    ></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {industry ? (
                        <div className="industry-details">
                            <div className="text-center mb-4">
                                <div
                                    className="icon-80 rounded-circle border mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
                                    style={{ width: "80px", height: "80px" }}
                                >
                                    <i className="fas fa-industry fa-2x text-muted"></i>
                                </div>
                                <h6 className="fsz-18 mb-1">{text(industry.i18nTitle, industry.title)}</h6>
                                <div className="text-muted fsz-12 mb-2">
                                    {t("industries.orderLabel", { order: String(industry.order || 0).padStart(2, "0") })}
                                </div>
                                <span className="badge bg-light text-dark border fsz-11">
                                    {statusText(industry.status || "Draft")}
                                </span>
                            </div>

                            <div className="details-list mb-4 d-flex flex-wrap gap-4">
                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("industries.short")}</label>
                                    <div className="fsz-13">
                                        {industry.short_description || industry.description || t("common.na")}
                                    </div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("industries.full")}</label>
                                    <div className="fsz-13">{industry.full_description || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                                        {t("industries.companiesWithCount", { count: companies.length })}
                                    </label>
                                    {companies.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {companies.map((code) => {
                                                const company = companiesByCode[code];
                                                return (
                                                    <span
                                                        key={code}
                                                        className="badge bg-light text-dark border fsz-11 d-inline-flex align-items-center gap-1"
                                                    >
                                                        {company?.image && (
                                                            <img
                                                                src={publicPath(company.image)}
                                                                alt=""
                                                                style={{ width: 14, height: 14, objectFit: "contain" }}
                                                            />
                                                        )}
                                                        {code}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="fsz-12 text-muted">{t("industries.noCompanies")}</div>
                                    )}
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-2">
                                        {t("companies.valueChain")}
                                    </label>
                                    <div className="d-flex flex-column gap-3">
                                        {VALUE_CHAIN_STAGES.map((stage) => {
                                            const stageCompanies = mapping[stage] || [];
                                            return (
                                                <div key={stage}>
                                                    <div className="fsz-12 fw-600 mb-1">{stageLabel(stage)}</div>
                                                    {stageCompanies.length > 0 ? (
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {stageCompanies.map((code) => {
                                                                const company = companiesByCode[code];
                                                                return (
                                                                    <span
                                                                        key={`${stage}-${code}`}
                                                                        className="badge bg-white text-dark border fsz-11 d-inline-flex align-items-center gap-1"
                                                                    >
                                                                        {company?.image && (
                                                                            <img
                                                                                src={publicPath(company.image)}
                                                                                alt={t("companies.logoAlt", { code })}
                                                                                style={{ width: 14, height: 14, objectFit: "contain" }}
                                                                            />
                                                                        )}
                                                                        {code}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="fsz-11 text-muted">{t("industries.noCompaniesShort")}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>{t("industries.loadingDetails")}</p>
                        </div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
