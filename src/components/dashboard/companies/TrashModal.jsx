"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { confirmAction } from "@/utils/confirm";

export default function TrashModal({
    isOpen,
    trashCompanies = [],
    onClose,
    onRestore,
    onPermanentDelete,
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div
                className="modal-backdrop fade show"
                onClick={onClose}
            ></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Recycle Bin</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>
                        <div className="modal-body">
                            {trashCompanies.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fal fa-trash-alt fa-3x mb-3"></i>
                                    <p>Trash is empty</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Company</th>
                                                <th>Code</th>
                                                <th>Type</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trashCompanies.map((company) => (
                                                <tr key={company.id}>
                                                    <td>{company.title}</td>
                                                    <td>{company.code || "-"}</td>
                                                    <td>{company.type || "-"}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-success me-2"
                                                            onClick={() => onRestore(company.id)}
                                                            title="Restore"
                                                        >
                                                            <i className="fal fa-trash-undo"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                confirmAction({
                                                                    title: "Delete Permanently?",
                                                                    message: "This action cannot be undone. Are you sure?",
                                                                    confirmLabel: "Delete Forever",
                                                                    onConfirm: () => onPermanentDelete(company.id),
                                                                });
                                                            }}
                                                            title="Delete Permanently"
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
