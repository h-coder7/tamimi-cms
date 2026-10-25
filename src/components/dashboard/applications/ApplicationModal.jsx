"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "@/components/shared/FileUpload";
import { useJobs } from "@/hooks/useJobs";
import { buildJobFilterOptions } from "@/lib/jobOptions";
import { toast } from "react-hot-toast";
import { useI18n } from "@/hooks/useI18n";

const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
};

const emptyForm = () => ({
  name: "",
  email: "",
  mobile: "",
  city: "",
  experience_years: "",
  job_id: "",
  consent: true,
  cvFiles: [],
});

export default function ApplicationModal({ isOpen, onClose, onSave }) {
  const { t, isRtl, text } = useI18n();
  const { data: jobs = [], refetch: refetchJobs } = useJobs();
  const [formData, setFormData] = useState(emptyForm);
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const jobOptions = useMemo(() => {
    const byId = new Map(jobs.map((job) => [job.id, job]));
    return buildJobFilterOptions(jobs).map((opt) => {
      const job = byId.get(opt.value);
      if (!job) return opt;
      return { ...opt, label: text(job.i18nTitle, job.title) };
    });
  }, [jobs, text]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refetchJobs();
    setFormData(emptyForm());
  }, [isOpen, refetchJobs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.job_id) {
      toast.error(t("validation.selectJob"));
      return;
    }
    if (!formData.name.trim()) {
      toast.error(t("validation.fullName"));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t("validation.email"));
      return;
    }
    if (!formData.consent) {
      toast.error(t("validation.consent"));
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
        experience_years:
          formData.experience_years === ""
            ? null
            : Number(formData.experience_years),
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
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content company-modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("applications.add")}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label={t("common.close")}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      {t("applications.job")} <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={jobOptions}
                      value={jobOptions.find((o) => o.value === formData.job_id) || null}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          job_id: opt?.value || "",
                        }))
                      }
                      placeholder={
                        jobOptions.length
                          ? t("applications.selectJobPh")
                          : t("applications.noJobs")
                      }
                      classNamePrefix="react-select"
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">
                      {t("applications.fullName")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      required
                      dir={isRtl ? "rtl" : "ltr"}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("applications.fullNamePh")}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">
                      {t("common.email")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      required
                      dir="ltr"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">{t("common.mobile")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      dir="ltr"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">{t("common.city")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      dir={isRtl ? "rtl" : "ltr"}
                      value={formData.city}
                      onChange={handleChange}
                      placeholder={t("applications.cityPh")}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">{t("applications.years")}</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="experience_years"
                      dir="ltr"
                      value={formData.experience_years}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">{t("applications.cvPdf")}</label>
                    <FileUpload
                      files={formData.cvFiles}
                      onFilesChange={(files) =>
                        setFormData((prev) => ({ ...prev, cvFiles: files }))
                      }
                      accept={PDF_ACCEPT}
                      maxFiles={1}
                      title={t("applications.uploadCv")}
                      hint={t("applications.cvHint")}
                    />
                  </div>

                  <div className="col-12 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="application-consent"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="application-consent">
                        {t("applications.consentLabel")} <span className="text-danger">*</span>
                      </label>
                    </div>
                    <small className="text-muted fsz-11 d-block mt-1">{t("applications.consentHint")}</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="butn-st2"
                  disabled={saving || !formData.job_id}
                >
                  {saving ? t("common.saving") : t("applications.add")}
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
