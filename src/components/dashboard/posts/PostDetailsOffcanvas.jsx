"use client";

import { useEffect, useState } from "react";
import { sanitizeRichText } from "@/lib/sanitizeRichText";
import { publicPath } from "@/utils/publicPath";
import { useI18n } from "@/hooks/useI18n";

const CATEGORY_STATUS = {
    News: "news",
    "Events & Exhibitions": "events_exhibitions",
    Insights: "insights",
    Article: "article",
    Press: "press",
};

function categoryLabel(value, statusText) {
    if (!value) return "";
    return statusText(CATEGORY_STATUS[value] || value);
}

export default function PostDetailsOffcanvas({ show, post, onClose }) {
    const { t, isRtl, statusText, text } = useI18n();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const isEvent = post?.category === "Events & Exhibitions";
    const title = post ? text(post.i18nTitle, post.title) : "";

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                style={{ visibility: show ? "visible" : "hidden", width: "480px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16">
                        <i className="fal fa-newspaper me-2"></i> {t("posts.details")}
                    </h5>
                    <button type="button" className="btn-close text-reset" onClick={onClose} aria-label={t("common.close")}></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {post ? (
                        <div>
                            {post.cover && (
                                <div className="mb-3 rounded-3 overflow-hidden border" style={{ height: 160 }}>
                                    <img
                                        src={publicPath(post.cover)}
                                        alt=""
                                        className="w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}

                            <h6 className="fsz-18 mb-3" dir={isRtl ? "rtl" : "ltr"}>{title}</h6>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                <span className="badge bg-light text-dark border fsz-11">{categoryLabel(post.category, statusText)}</span>
                                <span className="badge bg-light text-dark border fsz-11">{statusText(post.status)}</span>
                            </div>

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.summary")}</label>
                                <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"}>{post.summary || t("common.na")}</div>
                            </div>

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.body")}</label>
                                <div
                                    className="fsz-13"
                                    dir={isRtl ? "rtl" : "ltr"}
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeRichText(post.body) || `<p>${t("common.na")}</p>`,
                                    }}
                                />
                            </div>

                            {isEvent && (
                                <>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.event")}</label>
                                        <div className="fsz-13" dir="ltr">
                                            {post.event_start || "—"}
                                            {post.event_end ? ` → ${post.event_end}` : ""}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.venue")}</label>
                                        <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"}>{post.venue || "—"}</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("common.city")}</label>
                                        <div className="fsz-13" dir={isRtl ? "rtl" : "ltr"}>{post.city || "—"}</div>
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.company")}</label>
                                <div className="fsz-13">{post.company_code || t("common.none")}</div>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">{t("posts.publishDate")}</label>
                                <div className="fsz-13" dir="ltr">{post.publish_date || "—"}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">{t("common.loading")}</div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
