"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { USER_ROLES, USER_STATUSES } from "@/hooks/useUsers";

const emptyForm = () => ({
    name: "",
    email: "",
    role: "Admin",
    status: "Invited",
});

export default function UserModal({ isOpen, onClose, onSave, user }) {
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const roleOptions = useMemo(
        () =>
            USER_ROLES.map((role) => ({
                value: role.value,
                label: role.label,
            })),
        []
    );

    const statusOptions = useMemo(
        () => USER_STATUSES.map((status) => ({ value: status, label: status })),
        []
    );

    const selectedRole = USER_ROLES.find((role) => role.value === formData.role);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                role: user.role || "Admin",
                status: user.status || "Invited",
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role || "Admin",
            status: user ? formData.status : "Invited",
            is_sample: Boolean(user?.is_sample),
            locked: Boolean(user?.locked),
            last_sign_in: user?.last_sign_in || "",
        });
    };

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{user ? "Edit user" : "Add user"}</h5>
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
                                    />
                                    {!user && (
                                        <div className="form-text fsz-11">
                                            An activation link is sent to this address
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Role <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        options={roleOptions}
                                        value={roleOptions.find((o) => o.value === formData.role) || roleOptions[0]}
                                        onChange={(opt) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                role: opt?.value || "Admin",
                                            }))
                                        }
                                        classNamePrefix="react-select"
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                    {selectedRole?.description && (
                                        <div className="form-text fsz-11">{selectedRole.description}</div>
                                    )}
                                </div>

                                {user && (
                                    <div className="mb-0">
                                        <label className="form-label">Status</label>
                                        <Select
                                            options={statusOptions}
                                            value={statusOptions.find((o) => o.value === formData.status) || statusOptions[0]}
                                            onChange={(opt) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    status: opt?.value || "Invited",
                                                }))
                                            }
                                            classNamePrefix="react-select"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {user ? "Save" : "Send invite"}
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
