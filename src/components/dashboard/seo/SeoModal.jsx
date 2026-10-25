"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TITLE_MAX, DESC_MAX, computeSeoHealth } from "@/hooks/useSeo";
import { useI18n } from "@/hooks/useI18n";

function pageLabel(page, t) {
    if (!page?.pageSlug) return page?.page || "—";
    const key = `seo.page.${page.pageSlug}`;
    const label = t(key);
    return label === key ? page.page || page.pageSlug : label;
}

export default function SeoModal({ isOpen, onClose, onSave, page }) {
    const { t, isRtl, statusText } = useI18n();
    const [formData, setFormData] = useState({
        meta_title: "",
        meta_description: "",
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen || !page) return;
        setFormData({
            meta_title: page.meta_title || "",
            meta_description: page.meta_description || "",
        });
    }, [isOpen, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...page,
            meta_title: formData.meta_title.trim(),
            meta_description: formData.meta_description.trim(),
        });
    };

    if (!isOpen || !isMounted || !page) return null;

    const titleLen = formData.meta_title.length;
    const descLen = formData.meta_description.length;
    const health = computeSeoHealth(formData.meta_title, formData.meta_description);
    const proseDir = isRtl ? "rtl" : "ltr";

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("seo.edit")} — {pageLabel(page, t)}</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label mb-0">{t("seo.metaTitle")}</label>
                                        <span className={`fsz-11 ${titleLen > TITLE_MAX ? "text-warning" : "text-muted"}`} dir="ltr">
                                            {titleLen} / {TITLE_MAX}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="meta_title"
                                        dir={proseDir}
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        placeholder={t("seo.metaTitlePh")}
                                    />
                                    <div className="form-text fsz-11">{t("seo.recommended", { count: TITLE_MAX })}</div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label mb-0">{t("seo.metaDescription")}</label>
                                        <span className={`fsz-11 ${descLen > DESC_MAX ? "text-warning" : "text-muted"}`} dir="ltr">
                                            {descLen} / {DESC_MAX}
                                        </span>
                                    </div>
                                    <textarea
                                        className="form-control"
                                        name="meta_description"
                                        rows={4}
                                        dir={proseDir}
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                        placeholder={t("seo.metaDescPh")}
                                    />
                                    <div className="form-text fsz-11">{t("seo.recommended", { count: DESC_MAX })}</div>
                                </div>

                                <div className="alert alert-light border fsz-12 mb-0">
                                    {t("seo.healthPreview")}: <strong>{statusText(health)}</strong>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    {t("common.cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t("common.save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
