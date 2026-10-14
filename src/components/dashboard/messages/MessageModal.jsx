"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import FileUpload from "@/components/shared/FileUpload";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFormOptions, GROUP_VALUE } from "@/lib/companyOptions";
import { MESSAGE_TYPES } from "@/hooks/useMessages";
import { toast } from "react-hot-toast";

const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
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
  const { data: companies = [], refetch: refetchCompanies } = useCompanies();
  const [formData, setFormData] = useState(emptyForm);
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const companyOptions = useMemo(
    () => buildCompanyFormOptions(companies, { includeGroup: true }),
    [companies]
  );

  const typeOptions = useMemo(
    () => MESSAGE_TYPES.map((t) => ({ value: t, label: t })),
    []
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
      toast.error("Please select a target company");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!formData.body.trim()) {
      toast.error("Message is required");
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
              <h5 className="modal-title">Add message</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Type <span className="text-danger">*</span>
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
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Target company <span className="text-danger">*</span>
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
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Sender company</label>
                    <input
                      type="text"
                      name="company"
                      className="form-control"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Optional — company name of the sender"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="body"
                      className="form-control"
                      rows={4}
                      value={formData.body}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-2">
                    <label className="form-label">Attachments (PDF)</label>
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
                      hint="PDF only (max 5)"
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
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
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
