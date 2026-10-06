"use client";

import { useEffect, useState } from "react";
import { publicPath } from "@/utils/publicPath";

export default function CompanyDetailsOffcanvas({ show, company, onClose }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const website = company?.website || company?.domain || "";
    const pendingWebsite = !website || String(website).toLowerCase().includes("pending");
    const websiteHref = pendingWebsite
        ? ""
        : (website.startsWith("http") ? website : `https://${website}`);

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                id="companyDetailsOffcanvas"
                aria-labelledby="companyDetailsOffcanvasLabel"
                style={{ visibility: show ? "visible" : "hidden", width: "450px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16" id="companyDetailsOffcanvasLabel">
                        <i className="fal fa-building me-2"></i> Company Details
                    </h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {company ? (
                        <div className="company-details">
                            <div className="text-center mb-4">
                                <div className="icon-80 p-2 rounded-circle border mx-auto mb-3 overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                                    {company.image ? (
                                        <img src={publicPath(company.image)} alt="" className="img-contain h-100 w-100" />
                                    ) : (
                                        <i className="fas fa-building fa-2x text-muted"></i>
                                    )}
                                </div>
                                <h6 className="fsz-18 mb-1">{company.title}</h6>
                                <div className="text-muted fsz-12 mb-2">{company.code}</div>
                                <span className="badge bg-light text-dark border fsz-11 text-uppercase me-1">{company.type || "Company"}</span>
                                <span className="badge bg-light text-dark border fsz-11">{company.status || "Draft"}</span>
                            </div>

                            <div className="details-list mb-4 d-flex flex-wrap gap-4">
                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Field</label>
                                    <div className="fsz-13">{company.field || company.description || "N/A"}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Industries</label>
                                    <div className="fsz-13 mb-2">{company.industries_label || "0 industries · draft"}</div>
                                    {Array.isArray(company.industries) && company.industries.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {company.industries.map((industry) => (
                                                <span key={industry} className="badge bg-light text-dark border fsz-11">
                                                    {industry}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="fsz-12 text-muted">No industries mapped yet</div>
                                    )}
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Website</label>
                                    <div className="fsz-13">
                                        {pendingWebsite ? (
                                            <span className="text-muted">{website || "N/A"}</span>
                                        ) : (
                                            <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                                                <i className="fal fa-external-link me-2"></i>
                                                {website}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Created On</label>
                                    <div className="fsz-13">
                                        <i className="fal fa-calendar-alt me-2"></i>
                                        {company.created_at ? new Date(company.created_at).toLocaleDateString() : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading company details...</p>
                        </div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
