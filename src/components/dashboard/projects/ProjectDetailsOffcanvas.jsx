"use client";

import { useEffect, useState, useMemo } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useIndustries } from "@/hooks/useIndustries";
import { publicPath } from "@/utils/publicPath";
import { useI18n } from "@/hooks/useI18n";

export default function ProjectDetailsOffcanvas({ show, project, onClose }) {
    const { t, statusText, text } = useI18n();
    const { data: companies = [] } = useCompanies();
    const { data: industries = [] } = useIndustries();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const company = useMemo(() => {
        if (!project?.company_code) return null;
        return companies.find((item) => item.code === project.company_code) || null;
    }, [companies, project]);

    if (!isMounted) return null;

    const services = Array.isArray(project?.services) ? project.services : [];
    const stages = Array.isArray(project?.value_chain) ? project.value_chain : [];
    const industryMatch = industries.find((item) => item.title === project?.industry);
    const stageLabel = (stage) => {
        const label = t(`valueChain.${stage}`);
        return label === `valueChain.${stage}` ? stage : label;
    };

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                id="projectDetailsOffcanvas"
                aria-labelledby="projectDetailsOffcanvasLabel"
                style={{ visibility: show ? "visible" : "hidden", width: "480px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16" id="projectDetailsOffcanvasLabel">
                        <i className="fal fa-briefcase me-2"></i> {t("projects.details")}
                    </h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        onClick={onClose}
                        aria-label={t("common.close")}
                    ></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {project ? (
                        <div className="project-details">
                            {project.cover && (
                                <div className="mb-3 rounded-3 overflow-hidden border" style={{ height: 160 }}>
                                    <img
                                        src={publicPath(project.cover)}
                                        alt=""
                                        className="w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <h6 className="fsz-18 mb-2">{text(project.i18nTitle, project.title)}</h6>
                                {(project.content_label || project.is_sample) && (
                                    <div className="text-muted fsz-12 mb-2">
                                        {project.content_label || t("common.sample")}
                                    </div>
                                )}
                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-light text-dark border fsz-11">
                                        {statusText(project.status || "Draft")}
                                    </span>
                                    {project.featured && (
                                        <span className="badge bg-warning-subtle text-dark border fsz-11">
                                            {statusText("Featured")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="details-list d-flex flex-wrap gap-4">
                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.client")}</label>
                                    <div className="fsz-13">{project.client || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.location")}</label>
                                    <div className="fsz-13">{project.location || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.company")}</label>
                                    <div className="d-flex align-items-center gap-2 fsz-13">
                                        <div className="icon-30 p-1 rounded-circle border overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                            {company?.image ? (
                                                <img
                                                    src={publicPath(company.image)}
                                                    alt={t("companies.logoAlt", { code: project.company_code })}
                                                    className="img-contain h-100 w-100"
                                                />
                                            ) : (
                                                <i className="fal fa-building text-muted"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div dir="ltr">{project.company_code || t("common.na")}</div>
                                            {company?.title && (
                                                <small className="text-muted fsz-11">{text(company.i18nTitle, company.title)}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-item w-50">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.industry")}</label>
                                    <div className="fsz-13">{project.industry ? text(industryMatch?.i18nTitle, project.industry) : t("common.na")}</div>
                                </div>

                                <div className="detail-item w-50">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.year")}</label>
                                    <div className="fsz-13" dir="ltr">{project.year || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.summary")}</label>
                                    <div className="fsz-13">{project.summary || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("projects.challenge")}</label>
                                    <div className="fsz-13">{project.challenge || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("projects.solution")}</label>
                                    <div className="fsz-13">{project.solution || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("projects.result")}</label>
                                    <div className="fsz-13">{project.result || t("common.na")}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("projects.scope")}</label>
                                    {services.length > 0 ? (
                                        <ol className="fsz-13 mb-0 ps-3">
                                            {services.map((service, index) => (
                                                <li key={`${service}-${index}`}>{service}</li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <div className="fsz-12 text-muted">{t("projects.noServices")}</div>
                                    )}
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("projects.valueChain")}</label>
                                    {stages.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {stages.map((stage) => (
                                                <span key={stage} className="badge bg-light text-dark border fsz-11">
                                                    {stageLabel(stage)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="fsz-12 text-muted">{t("projects.noneSelected")}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>{t("projects.loadingDetails")}</p>
                        </div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
