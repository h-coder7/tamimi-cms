"use client";

import { useEffect, useState } from "react";
import {
  downloadApplicationCv,
  fetchApplicationCvBlobUrl,
} from "@/hooks/useApplications";
import { useI18n } from "@/hooks/useI18n";

export default function ApplicationDetailsOffcanvas({ show, application, onClose }) {
  const { t, text } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function loadPreview() {
      setPreviewUrl(null);
      setPreviewFailed(false);

      if (!show || !application?.id || !application.cv) {
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);
      try {
        objectUrl = await fetchApplicationCvBlobUrl(application);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setPreviewFailed(true);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [show, application?.id, application?.cv]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isMounted) return null;

  const handleDownloadCv = () => {
    downloadApplicationCv(application);
  };

  const jobTitle = application ? text(application.job_title) : "";

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
            <i className="fal fa-file-user me-2"></i> {t("applications.applicant")}
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={onClose}
            aria-label={t("common.close")}
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
                <div className="text-muted fsz-12 mb-2">
                  {jobTitle || t("status.application")}
                </div>
              </div>

              <div className="details-list mb-4 d-flex flex-wrap gap-4">
                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.email")}
                  </label>
                  <div className="fsz-13" dir="ltr">{application.email || "—"}</div>
                </div>

                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.mobile")}
                  </label>
                  <div className="fsz-13" dir="ltr">{application.mobile || "—"}</div>
                </div>

                <div className="detail-item w-50">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.city")}
                  </label>
                  <div className="fsz-13">{application.city || "—"}</div>
                </div>

                <div className="detail-item w-50">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("applications.years")}
                  </label>
                  <div className="fsz-13" dir="ltr">
                    {application.experience_years != null
                      ? application.experience_years
                      : "—"}
                  </div>
                </div>

                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("applications.consentField")}
                  </label>
                  <div className="fsz-13">
                    {application.consent ? t("applications.consentGiven") : t("applications.consentNotGiven")}
                  </div>
                </div>

                <div className="detail-item w-100">
                  <div className="alert alert-light border fsz-12 mb-0">
                    {t("applications.statusNote")}
                  </div>
                </div>

                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-2">
                    {t("applications.cvPreview")}
                  </label>
                  <div
                    className="border rounded-3 bg-light overflow-hidden mb-3"
                    style={{ minHeight: 280 }}
                  >
                    {!application.cv ? (
                      <div className="d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted" style={{ minHeight: 280 }}>
                        <i className="fal fa-file-pdf fa-2x mb-2"></i>
                        <div className="fsz-13">{t("applications.noCvUploaded")}</div>
                      </div>
                    ) : previewLoading ? (
                      <div className="d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted" style={{ minHeight: 280 }}>
                        <i className="fal fa-spinner fa-spin fa-2x mb-2"></i>
                        <div className="fsz-13">{t("applications.previewLoading")}</div>
                      </div>
                    ) : previewFailed ? (
                      <div className="d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted" style={{ minHeight: 280 }}>
                        <i className="fal fa-exclamation-circle fa-2x mb-2"></i>
                        <div className="fsz-13">{t("applications.previewFailed")}</div>
                      </div>
                    ) : previewUrl ? (
                      <iframe
                        title={t("applications.cvPreviewTitle")}
                        src={`${previewUrl}#toolbar=0&navpanes=0`}
                        className="w-100 border-0"
                        style={{ height: 360, background: "#fff" }}
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="butn-st2 w-100"
                    onClick={handleDownloadCv}
                    disabled={!application.cv}
                  >
                    <i className="fal fa-download me-2"></i>
                    {application.cv ? t("applications.downloadCv") : t("applications.noCvUploaded")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
              <p>{t("applications.loadingDetails")}</p>
            </div>
          )}
        </div>
      </div>
      {show && (
        <div className="offcanvas-backdrop fade show" onClick={onClose}></div>
      )}
    </>
  );
}
