function experienceLabel(years) {
  if (years == null || years === "") return "—";
  const n = Number(years);
  if (!Number.isFinite(n)) return "—";
  return `${n} ${n === 1 ? "year" : "years"}`;
}

export function applicationFromApi(app) {
  if (!app) return null;
  return {
    id: app.id,
    name: app.fullName || "",
    email: app.email || "",
    mobile: app.mobile || "",
    city: app.city || "",
    experience_years:
      app.yearsOfExperience != null ? Number(app.yearsOfExperience) : null,
    experience_label: experienceLabel(app.yearsOfExperience),
    job_id: app.jobId || null,
    job_title: app.jobTitle || "",
    applied_at: app.submittedAt
      ? String(app.submittedAt).slice(0, 10)
      : null,
    cv: Boolean(app.hasCv || app.cvFileId),
    consent: Boolean(app.consentGiven),
    consent_at: app.consentAt || null,
    is_sample: false,
    created_at: app.submittedAt
      ? String(app.submittedAt).slice(0, 10)
      : "",
  };
}

export function applicationToFormData(form) {
  const payload = {
    jobId: form.job_id,
    fullName: String(form.name || "").trim(),
    email: String(form.email || "").trim(),
    mobile: String(form.mobile || "").trim() || null,
    city: String(form.city || "").trim() || null,
    yearsOfExperience:
      form.experience_years === "" || form.experience_years == null
        ? null
        : Number(form.experience_years),
    consentGiven: Boolean(form.consent),
  };

  const fd = new FormData();
  fd.append("payload", JSON.stringify(payload));

  const cvFile = form.cvFiles?.[0]?.file;
  if (cvFile instanceof File) fd.append("cv", cvFile);

  return fd;
}
