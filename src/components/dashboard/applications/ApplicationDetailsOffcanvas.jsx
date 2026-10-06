"use client";

import { useEffect, useState } from "react";

export default function ApplicationDetailsOffcanvas({ show, application, onClose }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const handleDownloadCv = () => {
        const blob = new Blob(
            [`Sample CV for ${application?.name || "Applicant"}\nJob: ${application?.job_title || "-"}\n`],
            { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(application?.name || "applicant").replace(/\s+/g, "-").toLowerCase()}-cv.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                id="applicationDetailsOffcanvas"
                aria-labelledby="applicationDetailsOffcanvasLabel"
                style={{ visibility: show ? "visible" : "hidden", width: "450px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16" id="applicationDetailsOffcanvasLabel">
                        <i className="fal fa-file-user me-2"></i> Applicant
                    </h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {application ? (
                        <div className="application-details">
                            <div className="text-center mb-4">
                                <div
                                    className="icon-80 rounded-circle border mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
                                    style={{ width: "80px", height: "80px" }}
                                >
                                    <i className="fas fa-user fa-2x text-muted"></i>
                                </div>
                                <h6 className="fsz-18 mb-1">{application.name}</h6>
                                <div className="text-muted fsz-12 mb-2">{application.job_title || "Application"}</div>
                            </div>

                            <div className="details-list mb-4 d-flex flex-wrap gap-4">
                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Email</label>
                                    <div className="fsz-13">{application.email || "—"}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Mobile</label>
                                    <div className="fsz-13">{application.mobile || "[Sample]"}</div>
                                </div>

                                <div className="detail-item w-50">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">City</label>
                                    <div className="fsz-13">{application.city || "—"}</div>
                                </div>

                                <div className="detail-item w-50">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Years of experience</label>
                                    <div className="fsz-13">
                                        {application.experience_years != null ? application.experience_years : "—"}
                                    </div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">Data-processing consent</label>
                                    <div className="fsz-13">{application.consent ? "Given" : "Not given"}</div>
                                </div>

                                <div className="detail-item w-100">
                                    <div className="alert alert-light border fsz-12 mb-0">
                                        Status tracking (New / Shortlisted / Rejected) is optional and outside the contract scope.
                                    </div>
                                </div>

                                <div className="detail-item w-100">
                                    <label className="text-muted fsz-11 text-uppercase d-block mb-2">CV preview</label>
                                    <div
                                        className="border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center text-center p-4 mb-3"
                                        style={{ minHeight: 160 }}
                                    >
                                        <i className="fal fa-file-pdf fa-2x text-muted mb-2"></i>
                                        <div className="fsz-13 fw-500">CV PDF preview</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="butn-st2 w-100"
                                        onClick={handleDownloadCv}
                                    >
                                        <i className="fal fa-download me-2"></i>
                                        Download CV
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading application details...</p>
                        </div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
