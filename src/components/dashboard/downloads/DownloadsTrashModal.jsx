"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";

const TYPE_KEY = {
    "Company profile": "company_profile",
    Brochure: "brochure",
    Policy: "policy",
    Other: "other",
};

export default function DownloadsTrashModal({
    isOpen,
    trashItems = [],
    onClose,
    onRestore,
    onPermanentDelete,
}) {
    const { t, statusText, text } = useI18n();
    const { data: companies = [] } = useCompanies();
    const [isMounted, setIsMounted] = useState(false);

    const companiesByCode = useMemo(
        () => buildCompaniesByCode(companies, { includeGroup: true }),
        [companies]
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isOpen || !isMounted) return null;

    const companyLabel = (item) => {
        if (item.company_code === "TEG") return statusText("group");
        const company = companiesByCode[item.company_code];
        if (company?.i18nTitle || company?.title) {
            return text(company.i18nTitle, company.title || item.company_label || "");
        }
        return item.company_label || item.company_code || "—";
    };

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
                            {trashItems.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fal fa-trash-alt fa-3x mb-3"></i>
                                    <p>{t("common.trashEmpty")}</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>{t("common.title")}</th>
                                                <th>{t("common.type")}</th>
                                                <th>{t("common.company")}</th>
                                                <th>{t("common.actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trashItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{text(item.i18nTitle, item.title)}</td>
                                                    <td>{item.type ? statusText(TYPE_KEY[item.type] || item.type) : "—"}</td>
                                                    <td>{companyLabel(item)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-success me-2"
                                                            onClick={() => onRestore(item.id)}
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
                                                                    onConfirm: () => onPermanentDelete(item.id),
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
