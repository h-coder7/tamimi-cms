"use client";

import { useEffect, useState } from "react";
import { publicPath } from "@/utils/publicPath";
import { downloadMessageAttachment } from "@/hooks/useMessages";
import { useI18n } from "@/hooks/useI18n";

const TYPE_KEY = {
  Inquiry: "inquiry",
  Contact: "contact",
  Application: "application",
};

export default function MessageDetailsOffcanvas({
  show,
  message,
  onClose,
  company,
  onMarkUnread,
  onDelete,
}) {
  const { t, isRtl, statusText, text } = useI18n();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const companyName =
    message?.company_code === "TEG"
      ? statusText("group")
      : text(company?.i18nTitle, company?.title || message?.company_label || message?.company_code || "—");

  return (
    <>
      <div
        className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
        tabIndex="-1"
        id="messageDetailsOffcanvas"
        aria-labelledby="messageDetailsOffcanvasLabel"
        style={{ visibility: show ? "visible" : "hidden", width: "450px" }}
      >
        <div className="offcanvas-header border-bottom py-3">
          <h5 className="offcanvas-title fsz-16" id="messageDetailsOffcanvasLabel">
            <i className="fal fa-envelope me-2"></i> {t("messages.details")}
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={onClose}
            aria-label={t("common.close")}
          ></button>
        </div>
        <div className="offcanvas-body p-4 custom-scroll">
          {message ? (
            <div className="message-details">
              <div className="text-center mb-4">
                <div
                  className="icon-80 rounded-circle border mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className="fas fa-envelope fa-2x text-muted"></i>
                </div>
                <h6 className="fsz-18 mb-1" dir={isRtl ? "rtl" : "ltr"}>{message.name}</h6>
                <div className="text-muted fsz-12 mb-2" dir="ltr">{message.email}</div>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <span className="badge bg-light text-dark border fsz-11">
                    {statusText(TYPE_KEY[message.type] || message.type)}
                  </span>
                  <span className="badge bg-light text-dark border fsz-11">
                    {statusText(message.status)}
                  </span>
                </div>
              </div>

              <div className="details-list mb-4 d-flex flex-wrap gap-4">
                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.subject")}
                  </label>
                  <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"}>{message.subject || "—"}</div>
                </div>

                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("messages.target")}
                  </label>
                  <div className="d-flex align-items-center gap-2 fsz-13">
                    {(company?.image || message.company_code === "TEG") && (
                      <div className="icon-30 p-1 rounded-circle border overflow-hidden bg-light d-flex align-items-center justify-content-center">
                        <img
                          src={publicPath(company?.image || "/images/logo.png")}
                          alt=""
                          className="img-contain h-100 w-100"
                        />
                      </div>
                    )}
                    <span>
                      {companyName}
                    </span>
                  </div>
                </div>

                <div className="detail-item w-50">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.date")}
                  </label>
                  <div className="fsz-13" dir="ltr">{message.received_at || "—"}</div>
                </div>

                <div className="detail-item w-50">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("common.mobile")}
                  </label>
                  <div className="fsz-13" dir="ltr">{message.mobile || "—"}</div>
                </div>

                {message.company ? (
                  <div className="detail-item w-100">
                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                      {t("messages.senderCompany")}
                    </label>
                    <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"}>{message.company}</div>
                  </div>
                ) : null}

                <div className="detail-item w-100">
                  <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                    {t("messages.message")}
                  </label>
                  <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"} style={{ whiteSpace: "pre-wrap" }}>
                    {message.body || "—"}
                  </div>
                </div>

                {message.attachments?.length ? (
                  <div className="detail-item w-100">
                    <label className="text-muted fsz-11 text-uppercase d-block mb-1">
                      {t("messages.attachments")}
                    </label>
                    <div className="d-flex flex-column gap-2">
                      {message.attachments.map((att) => (
                        <button
                          key={att.fileId}
                          type="button"
                          className="btn btn-sm btn-outline-secondary text-start"
                          dir="ltr"
                          onClick={() =>
                            downloadMessageAttachment(message, att)
                          }
                        >
                          <i className="fal fa-file-pdf me-2"></i>
                          {att.name || "attachment.pdf"}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="d-flex flex-wrap gap-2">
                {message.status === "Read" && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => onMarkUnread?.(message)}
                  >
                    {t("messages.unread")}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete?.(message)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fal fa-spinner fa-spin fa-2x mb-3"></i>
              <p>{t("messages.loadingDetails")}</p>
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
