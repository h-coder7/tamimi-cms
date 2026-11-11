"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { USER_STATUSES } from "@/hooks/useUsers";
import { useI18n } from "@/hooks/useI18n";

const emptyForm = () => ({
    name: "",
    email: "",
    status: "Active",
    password: "",
    passwordConfirmation: "",
});

export default function UserModal({ isOpen, onClose, onSave, user }) {
    const { t, isRtl, statusText } = useI18n();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const statusOptions = useMemo(
        () => USER_STATUSES.map((status) => ({ value: status, label: statusText(status) })),
        [statusText]
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setShowPassword(false);
        setShowConfirmPassword(false);

        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                status: user.status === "Inactive" ? "Inactive" : "Active",
                password: "",
                passwordConfirmation: "",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const passwordsMismatch =
        Boolean(formData.password || formData.passwordConfirmation) &&
        formData.password !== formData.passwordConfirmation;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user && !formData.password) return;
        if (passwordsMismatch) return;
        if (saving) return;

        setSaving(true);
        try {
            await onSave({
                name: formData.name.trim(),
                email: formData.email.trim(),
                status: user ? formData.status : "Active",
                password: formData.password || undefined,
                passwordConfirmation: formData.passwordConfirmation || undefined,
                is_sample: Boolean(user?.is_sample),
                locked: false,
                last_sign_in: user?.last_sign_in || "",
            });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{user ? t("admins.edit") : t("admins.addTitle")}</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")} disabled={saving}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("admins.fullName")} <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        required
                                        dir={isRtl ? "rtl" : "ltr"}
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t("admins.namePh")}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("admins.workEmail")} <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        required
                                        dir="ltr"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t("admins.emailPh")}
                                        disabled={Boolean(user) || saving}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("common.password")}{" "}
                                        {!user && <span className="text-danger">*</span>}
                                        {user && (
                                            <span className="text-muted fsz-11 fw-normal">
                                                {t("admins.passwordHint")}
                                            </span>
                                        )}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            name="password"
                                            required={!user}
                                            minLength={user ? undefined : 8}
                                            dir="ltr"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={t("admins.passwordPh")}
                                            autoComplete="new-password"
                                            disabled={saving}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            title={showPassword ? t("admins.hidePassword") : t("admins.showPassword")}
                                            aria-label={showPassword ? t("admins.hidePassword") : t("admins.showPassword")}
                                            disabled={saving}
                                        >
                                            <i className={`fal ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        {t("admins.confirmPassword")}{" "}
                                        {!user && <span className="text-danger">*</span>}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-control"
                                            name="passwordConfirmation"
                                            required={!user || Boolean(formData.password)}
                                            minLength={user && !formData.password ? undefined : 8}
                                            dir="ltr"
                                            value={formData.passwordConfirmation}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            disabled={saving}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            title={showConfirmPassword ? t("admins.hideConfirmPassword") : t("admins.showConfirmPassword")}
                                            aria-label={showConfirmPassword ? t("admins.hideConfirmPassword") : t("admins.showConfirmPassword")}
                                            disabled={saving}
                                        >
                                            <i className={`fal ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                    {passwordsMismatch && (
                                        <div className="form-text text-danger fsz-11">
                                            {t("admins.passwordMismatch")}
                                        </div>
                                    )}
                                </div>

                                {user && (
                                    <div className="mb-0">
                                        <label className="form-label">{t("common.status")}</label>
                                        <Select
                                            options={statusOptions}
                                            value={
                                                statusOptions.find((o) => o.value === formData.status) ||
                                                statusOptions[0]
                                            }
                                            onChange={(opt) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    status: opt?.value || "Active",
                                                }))
                                            }
                                            isDisabled={saving}
                                            isRtl={isRtl}
                                            classNamePrefix="react-select"
                                            menuPortalTarget={
                                                typeof document !== "undefined" ? document.body : null
                                            }
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={passwordsMismatch || saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t("common.saving") || "Saving..."}
                                        </>
                                    ) : user ? (
                                        t("common.save")
                                    ) : (
                                        t("admins.create")
                                    )}
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
