"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TITLE_MAX, DESC_MAX, computeSeoHealth } from "@/hooks/useSeo";

export default function SeoModal({ isOpen, onClose, onSave, page }) {
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

    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit SEO — {page.page}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label mb-0">Meta title</label>
                                        <span className={`fsz-11 ${titleLen > TITLE_MAX ? "text-warning" : "text-muted"}`}>
                                            {titleLen} / {TITLE_MAX}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        placeholder="e.g. Careers | Tamimi Energy Group"
                                    />
                                    <div className="form-text fsz-11">Recommended up to {TITLE_MAX} characters</div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label mb-0">Meta description</label>
                                        <span className={`fsz-11 ${descLen > DESC_MAX ? "text-warning" : "text-muted"}`}>
                                            {descLen} / {DESC_MAX}
                                        </span>
                                    </div>
                                    <textarea
                                        className="form-control"
                                        name="meta_description"
                                        rows={4}
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                        placeholder="Short summary for search results"
                                    />
                                    <div className="form-text fsz-11">Recommended up to {DESC_MAX} characters</div>
                                </div>

                                <div className="alert alert-light border fsz-12 mb-0">
                                    Health preview: <strong>{health}</strong>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save
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
