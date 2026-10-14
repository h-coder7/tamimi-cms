"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { useCompanies } from "@/hooks/useCompanies";
import {
    VALUE_CHAIN_STAGES,
    emptyValueChainMapping,
} from "@/hooks/useIndustries";
import { publicPath } from "@/utils/publicPath";

const SHORT_DESC_MAX = 160;

const emptyForm = () => ({
    title: "",
    order: "",
    status: "Draft",
    short_description: "",
    full_description: "",
    companies: [],
    value_chain_mapping: emptyValueChainMapping(),
});

const Section = ({ title, hint, children }) => (
    <div className="col-12 mb-4">
        <h6 className="fsz-12 text-uppercase fw-600 text-muted mb-1 border-bottom pb-2">{title}</h6>
        {hint && <p className="fsz-11 text-muted mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export default function IndustryModal({ isOpen, onClose, onSave, industry }) {
    const { data: allCompanies = [] } = useCompanies();
    const [formData, setFormData] = useState(emptyForm);
    const [isMounted, setIsMounted] = useState(false);

    const statusOptions = useMemo(
        () => [
            { value: "Draft", label: "Draft" },
            { value: "Published", label: "Published" },
        ],
        []
    );

    const companiesByCode = useMemo(() => {
        const map = {};
        allCompanies.forEach((company) => {
            if (company.code) map[company.code] = company;
        });
        return map;
    }, [allCompanies]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (industry) {
            setFormData({
                title: industry.title || "",
                order: industry.order ?? "",
                status: industry.status || "Draft",
                short_description: industry.short_description || industry.description || "",
                full_description: industry.full_description || "",
                companies: Array.isArray(industry.companies) ? [...industry.companies] : [],
                value_chain_mapping: {
                    ...emptyValueChainMapping(),
                    ...(industry.value_chain_mapping || {}),
                },
            });
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, industry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "short_description" && value.length > SHORT_DESC_MAX) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCompany = (code) => {
        setFormData((prev) => {
            const exists = prev.companies.includes(code);
            if (exists) {
                const nextMapping = { ...prev.value_chain_mapping };
                VALUE_CHAIN_STAGES.forEach((stage) => {
                    nextMapping[stage] = (nextMapping[stage] || []).filter((c) => c !== code);
                });
                return {
                    ...prev,
                    companies: prev.companies.filter((c) => c !== code),
                    value_chain_mapping: nextMapping,
                };
            }
            return {
                ...prev,
                companies: [...prev.companies, code],
            };
        });
    };

    const toggleStageCompany = (stage, code) => {
        setFormData((prev) => {
            const current = prev.value_chain_mapping[stage] || [];
            const exists = current.includes(code);
            const nextStageCompanies = exists
                ? current.filter((c) => c !== code)
                : [...current, code];

            const nextCompanies = prev.companies.includes(code)
                ? prev.companies
                : [...prev.companies, code];

            return {
                ...prev,
                companies: nextCompanies,
                value_chain_mapping: {
                    ...prev.value_chain_mapping,
                    [stage]: nextStageCompanies,
                },
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            title: formData.title.trim(),
            order: formData.order === "" ? null : Number(formData.order),
            status: formData.status,
            short_description: formData.short_description.trim(),
            full_description: formData.full_description.trim(),
            description: formData.short_description.trim(),
            companies: formData.companies,
            value_chain_mapping: formData.value_chain_mapping,
        });
    };

    if (!isOpen || !isMounted) return null;

    const shortCount = formData.short_description.length;

    return createPortal(
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content company-modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {industry ? "Edit Industry" : "Add New Industry"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <Section title="Content">
                                        <div className="row">
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">
                                                    Industry name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Oil & Gas"
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">Display order</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    name="order"
                                                    value={formData.order}
                                                    onChange={handleChange}
                                                    placeholder="1"
                                                    required
                                                />
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <label className="form-label">Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find((o) => o.value === formData.status) || null}
                                                    onChange={(opt) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            status: opt?.value || "Draft",
                                                        }))
                                                    }
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="form-label mb-0">Short description</label>
                                                    <small className={`fsz-11 ${shortCount >= SHORT_DESC_MAX ? "text-danger" : "text-muted"}`}>
                                                        {shortCount}/{SHORT_DESC_MAX}
                                                    </small>
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    name="short_description"
                                                    rows={3}
                                                    value={formData.short_description}
                                                    onChange={handleChange}
                                                    placeholder="Short industry summary"
                                                />
                                                <small className="text-muted fsz-11">
                                                    Draft copy · awaiting client approval · max {SHORT_DESC_MAX} characters
                                                </small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Full description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="full_description"
                                                    rows={4}
                                                    value={formData.full_description}
                                                    onChange={handleChange}
                                                    placeholder="[Pending: client marketing]"
                                                />
                                                <small className="text-muted fsz-11">Shown on the industry page</small>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        title="Companies in this industry"
                                        hint="Draft mapping prepared by Inspire from each company's published activities. Awaiting approval from the client marketing team."
                                    >
                                        <div className="d-flex flex-wrap gap-2">
                                            {allCompanies.map((company) => {
                                                const selected = formData.companies.includes(company.code);
                                                return (
                                                    <button
                                                        key={company.id}
                                                        type="button"
                                                        className={`btn fsz-12 py-2 px-3 border ${
                                                            selected
                                                                ? "btn-dark"
                                                                : "btn-light"
                                                        }`}
                                                        onClick={() => toggleCompany(company.code)}
                                                        title={company.title}
                                                    >
                                                        {company.image && (
                                                            <img
                                                                src={publicPath(company.image)}
                                                                alt=""
                                                                className="me-2 rounded-circle"
                                                                style={{ width: 18, height: 18, objectFit: "contain" }}
                                                            />
                                                        )}
                                                        {company.code}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {formData.companies.length > 0 && (
                                            <div className="mt-3 text-muted fsz-12">
                                                {formData.companies.length} companies selected
                                            </div>
                                        )}
                                    </Section>

                                    <Section
                                        title="Value-chain stages (from company mapping)"
                                        hint="Map selected companies into each value-chain stage shown on the industry page."
                                    >
                                        <div className="d-flex flex-column gap-4">
                                            {VALUE_CHAIN_STAGES.map((stage) => {
                                                const stageCompanies = formData.value_chain_mapping[stage] || [];
                                                return (
                                                    <div key={stage} className="border rounded-3 p-3 bg-light bg-opacity-50">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="fsz-13 fw-600 mb-0">{stage}</h6>
                                                            <span className="badge bg-white text-dark border fsz-11">
                                                                {stageCompanies.length} companies
                                                            </span>
                                                        </div>

                                                        {stageCompanies.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                                {stageCompanies.map((code) => {
                                                                    const company = companiesByCode[code];
                                                                    return (
                                                                        <span
                                                                            key={`${stage}-${code}`}
                                                                            className="badge bg-white text-dark border fsz-12 py-2 px-3 d-inline-flex align-items-center gap-2"
                                                                        >
                                                                            {company?.image ? (
                                                                                <img
                                                                                    src={publicPath(company.image)}
                                                                                    alt={`${code} logo`}
                                                                                    style={{ width: 20, height: 20, objectFit: "contain" }}
                                                                                />
                                                                            ) : (
                                                                                <i className="fal fa-building"></i>
                                                                            )}
                                                                            {code}
                                                                            <button
                                                                                type="button"
                                                                                className="btn p-0 border-0 text-muted lh-1"
                                                                                onClick={() => toggleStageCompany(stage, code)}
                                                                                aria-label={`Remove ${code}`}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        <div className="d-flex flex-wrap gap-2">
                                                            {(formData.companies.length > 0 ? formData.companies : allCompanies.map((c) => c.code)).map((code) => {
                                                                const active = stageCompanies.includes(code);
                                                                const company = companiesByCode[code];
                                                                return (
                                                                    <button
                                                                        key={`${stage}-pick-${code}`}
                                                                        type="button"
                                                                        className={`btn btn-sm border fsz-11 ${
                                                                            active ? "btn-dark" : "btn-white"
                                                                        }`}
                                                                        onClick={() => toggleStageCompany(stage, code)}
                                                                        title={company?.title || code}
                                                                    >
                                                                        {company?.image && (
                                                                            <img
                                                                                src={publicPath(company.image)}
                                                                                alt=""
                                                                                className="me-1"
                                                                                style={{ width: 14, height: 14, objectFit: "contain" }}
                                                                            />
                                                                        )}
                                                                        {code}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="butn-st2">
                                    {industry ? "Update Industry" : "Add Industry"}
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
