"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "@/components/shared/FileUpload";
import { useJobs } from "@/hooks/useJobs";
import { buildJobFilterOptions } from "@/lib/jobOptions";
import { toast } from "react-hot-toast";

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
  const { data: jobs = [], refetch: refetchJobs } = useJobs();
  const [formData, setFormData] = useState(emptyForm);
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const jobOptions = useMemo(() => buildJobFilterOptions(jobs), [jobs]);

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
      toast.error("Please select a job");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.consent) {
      toast.error("Consent is required");
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
              <h5 className="modal-title">Add application</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Job <span className="text-danger">*</span>
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
                          ? "Select job"
                          : "No jobs yet — create a job first"
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
                      Full name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Dammam"
                    />
                  </div>

                  <div className="col-lg-6 mb-3">
                    <label className="form-label">Years of experience</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">CV (PDF)</label>
                    <FileUpload
                      files={formData.cvFiles}
                      onFilesChange={(files) =>
                        setFormData((prev) => ({ ...prev, cvFiles: files }))
                      }
                      accept={PDF_ACCEPT}
                      maxFiles={1}
                      title="Upload CV"
                      hint="Optional PDF, max 10MB"
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
                        Data-processing consent given <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="butn-st2"
                  disabled={saving || !formData.job_id}
                >
                  {saving ? "Saving..." : "Add application"}
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
