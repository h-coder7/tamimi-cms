"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/hooks/useI18n";
import { publicPath } from "@/utils/publicPath";

export default function ReorderModal({
    isOpen,
    onClose,
    title,
    items = [],
    onSaveOrder,
    isSaving = false,
}) {
    const { t, isRtl } = useI18n();
    const [orderedItems, setOrderedItems] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setOrderedItems([...items]);
        setErrorMessage("");
        setDragIndex(null);
    }, [isOpen, items]);

    if (!isOpen || !isMounted) return null;

    const moveItem = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= orderedItems.length) return;
        setOrderedItems((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        moveItem(dragIndex, index);
        setDragIndex(index);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
    };

    const handleReset = () => {
        setOrderedItems([...items]);
        setErrorMessage("");
    };

    const handleSave = async () => {
        if (isSaving) return;
        setErrorMessage("");
        try {
            const ids = orderedItems.map((item) => item.id).filter(Boolean);
            if (new Set(ids).size !== ids.length) {
                setErrorMessage(t("errors.order.duplicate_ids") || "Duplicate ids are not allowed in order list");
                return;
            }
            await onSaveOrder(ids);
            onClose();
        } catch (err) {
            setErrorMessage(err?.message || t("common.reorderFailed") || "Could not save order");
        }
    };

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title mb-0">{title || t("common.reorder")}</h5>
                                <small className="text-muted fsz-11">{t("common.dragReorderHint")}</small>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={isSaving}
                                aria-label={t("common.close")}
                            ></button>
                        </div>

                        <div className="modal-body p-3">
                            {errorMessage && (
                                <div className="alert alert-danger fsz-12 mb-3 py-2 px-3">
                                    <i className="fal fa-exclamation-triangle me-2"></i>
                                    {errorMessage}
                                </div>
                            )}

                            {orderedItems.length === 0 ? (
                                <div className="text-center py-4 text-muted fsz-12">
                                    {t("common.noData") || "No items to order"}
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {orderedItems.map((item, index) => {
                                        const isDragging = dragIndex === index;
                                        const displayOrder = index + 1;
                                        return (
                                            <div
                                                key={item.id}
                                                draggable={!isSaving}
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`
                                                    p-2 rounded-3 border bg-white d-flex align-items-center justify-content-between gap-3
                                                    ${isDragging ? "shadow-sm border-primary opacity-75" : "hover-bg-light"}
                                                `}
                                                style={{ cursor: isSaving ? "default" : "grab", userSelect: "none" }}
                                            >
                                                <div className="d-flex align-items-center gap-3 overflow-hidden">
                                                    <span className="badge bg-light text-dark border fsz-11 px-2 py-1" style={{ minWidth: "32px", textAlign: "center" }}>
                                                        {displayOrder}
                                                    </span>

                                                    <i className="fal fa-grip-vertical text-muted fsz-14"></i>

                                                    {item.image && (
                                                        <div className="icon-35 rounded border overflow-hidden bg-light flex-shrink-0 d-flex align-items-center justify-content-center">
                                                            <img
                                                                src={publicPath(item.image)}
                                                                alt=""
                                                                className="img-contain w-100 h-100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="overflow-hidden">
                                                        <div className="fw-500 fsz-13 text-truncate">
                                                            {item.title}
                                                            {item.code && (
                                                                <span className="badge bg-secondary-subtle text-secondary ms-2 fsz-10">
                                                                    {item.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.subtitle && (
                                                            <small className="text-muted fsz-11 d-block text-truncate">
                                                                {item.subtitle}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                                                        onClick={() => moveItem(index, index - 1)}
                                                        disabled={index === 0 || isSaving}
                                                        title={t("common.moveUp")}
                                                        aria-label={t("common.moveUp")}
                                                    >
                                                        <i className="fal fa-arrow-up"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                                                        onClick={() => moveItem(index, index + 1)}
                                                        disabled={index === orderedItems.length - 1 || isSaving}
                                                        title={t("common.moveDown")}
                                                        aria-label={t("common.moveDown")}
                                                    >
                                                        <i className="fal fa-arrow-down"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleReset}
                                disabled={isSaving}
                            >
                                <i className="fal fa-undo me-1"></i>
                                {t("common.reset")}
                            </button>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light btn-sm"
                                    onClick={onClose}
                                    disabled={isSaving}
                                >
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSave}
                                    disabled={isSaving || orderedItems.length === 0}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t("common.reordering") || t("common.saving")}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fal fa-check me-1"></i>
                                            {t("common.saveOrder")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
