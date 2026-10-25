"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "@/components/shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions, GROUP_VALUE } from "@/lib/companyOptions";
import { MESSAGE_TYPES } from "@/hooks/useMessages";
import { toast } from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
};

const TYPE_KEY = {
  Inquiry: "inquiry",
  Contact: "contact",
  Application: "application",
};

const emptyForm = () => ({
  type: "Inquiry",
  name: "",
  email: "",
  mobile: "",
  city: "",
  company: "",
  subject: "",
  body: "",
  target_company: GROUP_VALUE,
  attachmentFiles: [],
});

export default function MessageModal({ isOpen, onClose, onSave }) {
  const { t, isRtl, statusText, text } = useI18n();
  const { data: companies = [], refetch: refetchCompanies } = useCompanies();
  const [formData, setFormData] = useState(emptyForm);
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const companyOptions = useMemo(() => {
    return buildCompanyFormOptions(companies, { includeGroup: true }).map((opt) => {
      if (opt.value === GROUP_VALUE) return { ...opt, label: statusText("group") };
      const company = companies.find((item) => item.id === opt.value);
      if (!company) return opt;
      const name = text(company.i18nTitle, company.title || "");
      const label = company.code ? `${company.code} — ${name}`.trim() : name;
      return { ...opt, label: label || opt.label };
    });
  }, [companies, statusText, text]);

  const typeOptions = useMemo(
    () =>
      MESSAGE_TYPES.map((type) => ({
        value: type,
        label: statusText(TYPE_KEY[type] || type),
      })),
    [statusText]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refetchCompanies();
    setFormData(emptyForm());
  }, [isOpen, refetchCompanies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.target_company) {
      toast.error(t("validation.selectCompany"));
      return;
    }
    if (!formData.name.trim()) {
      toast.error(t("validation.name"));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t("validation.email"));
      return;
    }
    if (!formData.subject.trim()) {
      toast.error(t("validation.subject"));
      return;
    }
    if (!formData.body.trim()) {
      toast.error(t("validation.message"));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        city: formData.city.trim(),
        company: formData.company.trim(),
        subject: formData.subject.trim(),
        body: formData.body.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !isMounted) return null;

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
              <h5 className="modal-title">{t("messages.add")}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {t("common.type")} <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={typeOptions}
                      value={typeOptions.find((o) => o.value === formData.type) || null}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: opt?.value || "Inquiry",
                        }))
                      }
                      isRtl={isRtl}
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {t("messages.target")} <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={companyOptions}
                      value={
                        companyOptions.find(
                          (o) => o.value === formData.target_company
                        ) || null
                      }
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          target_company: opt?.value || GROUP_VALUE,
                        }))
                      }
                      isRtl={isRtl}
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {t("common.name")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      dir={proseDir}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {t("common.email")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      dir="ltr"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("common.mobile")}</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      dir="ltr"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("common.city")}</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      dir={proseDir}
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">{t("messages.senderCompany")}</label>
                    <input
                      type="text"
                      name="company"
                      className="form-control"
                      dir={proseDir}
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={t("messages.senderPh")}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      {t("common.subject")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      dir={proseDir}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      {t("messages.message")} <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="body"
                      className="form-control"
                      rows={4}
                      dir={proseDir}
                      value={formData.body}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-2">
                    <FileUpload
                      accept={PDF_ACCEPT}
                      maxFiles={5}
                      files={formData.attachmentFiles}
                      onFilesChange={(files) =>
                        setFormData((prev) => ({
                          ...prev,
                          attachmentFiles: files,
                        }))
                      }
                      title={t("messages.attachmentsPdf")}
                      hint={t("messages.pdfHint")}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                  disabled={saving}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t("common.saving") : t("common.save")}
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
