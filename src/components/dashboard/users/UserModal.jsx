"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { USER_STATUSES } from "@/hooks/useUsers";

const emptyForm = () => ({
    name: "",
    email: "",
    status: "Active",
    password: "",
    passwordConfirmation: "",
});

export default function UserModal({ isOpen, onClose, onSave, user }) {
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const statusOptions = useMemo(
        () => USER_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user && !formData.password) return;
        if (passwordsMismatch) return;

        onSave({
            name: formData.name.trim(),
            email: formData.email.trim(),
            status: user ? formData.status : "Active",
            password: formData.password || undefined,
            passwordConfirmation: formData.passwordConfirmation || undefined,
            is_sample: Boolean(user?.is_sample),
            locked: false,
            last_sign_in: user?.last_sign_in || "",
        });
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
                            <h5 className="modal-title">{user ? "Edit admin" : "Add admin"}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Full name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Sara Al-Harbi"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Work email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@tamimienergy.com"
                                        disabled={Boolean(user)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Password{" "}
                                        {!user && <span className="text-danger">*</span>}
                                        {user && (
                                            <span className="text-muted fsz-11 fw-normal">
                                                (leave blank to keep current)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        required={!user}
                                        minLength={user ? undefined : 8}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 chars, upper, digit, symbol"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm password{" "}
                                        {!user && <span className="text-danger">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="passwordConfirmation"
                                        required={!user || Boolean(formData.password)}
                                        minLength={user && !formData.password ? undefined : 8}
                                        value={formData.passwordConfirmation}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                    {passwordsMismatch && (
                                        <div className="form-text text-danger fsz-11">
                                            Passwords do not match
                                        </div>
                                    )}
                                </div>

                                {user && (
                                    <div className="mb-0">
                                        <label className="form-label">Status</label>
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
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={passwordsMismatch}
                                >
                                    {user ? "Save" : "Create admin"}
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
