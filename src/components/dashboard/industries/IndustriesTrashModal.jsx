"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";

export default function IndustriesTrashModal({
    isOpen,
    trashIndustries = [],
    onClose,
    onRestore,
    onPermanentDelete,
}) {
    const { t, statusText, text } = useI18n();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("common.recycleBin")}</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
                        </div>
                        <div className="modal-body">
                            {trashIndustries.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fal fa-trash-alt fa-3x mb-3"></i>
                                    <p>{t("common.trashEmpty")}</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>{t("common.order")}</th>
                                                <th>{t("common.industry")}</th>
                                                <th>{t("common.status")}</th>
                                                <th>{t("common.actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trashIndustries.map((industry) => (
                                                <tr key={industry.id}>
                                                    <td dir="ltr">{String(industry.order || 0).padStart(2, "0")}</td>
                                                    <td>{text(industry.i18nTitle, industry.title)}</td>
                                                    <td>{statusText(industry.status || "Draft")}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-success me-2"
                                                            onClick={() => onRestore(industry.id)}
                                                            title={t("common.restore")}
                                                        >
                                                            <i className="fal fa-trash-undo"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                confirmAction({
                                                                    title: t("confirm.deleteForeverTitle"),
                                                                    message: t("confirm.deleteForeverMessage"),
                                                                    confirmLabel: t("confirm.deleteForever"),
                                                                    onConfirm: () => onPermanentDelete(industry.id),
                                                                });
                                                            }}
                                                            title={t("common.deleteForever")}
                                                        >
                                                            <i className="fal fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
