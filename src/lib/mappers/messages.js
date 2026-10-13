import { GROUP_CODE, GROUP_VALUE } from "@/lib/companyOptions";

function pickBilingual(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || value.ar || "";
}

const TYPE_TO_UI = { contact: "Contact", inquiry: "Inquiry" };
const TYPE_TO_API = { Contact: "contact", Inquiry: "inquiry" };
const STATUS_TO_UI = { new: "New", read: "Read" };
const STATUS_TO_API = { New: "new", Read: "read" };

export function messageFromApi(msg) {
  if (!msg) return null;

  const isGroup = msg.targetCompany === GROUP_VALUE || msg.targetCompany === "group";
  const company_code = isGroup
    ? GROUP_CODE
    : msg.targetCompanyRef?.shortCode || "";
  const company_label = isGroup
    ? "Tamimi Energy Group"
    : pickBilingual(msg.targetCompanyRef?.name) || company_code || "";

  return {
    id: msg.id,
    name: msg.name || "",
    email: msg.email || "",
    mobile: msg.mobile || "",
    city: msg.city || "",
    company: msg.company || "",
    type: TYPE_TO_UI[msg.type] || "Inquiry",
    company_code,
    company_label,
    target_company: isGroup ? GROUP_VALUE : msg.targetCompany || "",
    subject: msg.subject || "",
    body: msg.message || "",
    attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    forwarded_to: Array.isArray(msg.forwardedTo) ? msg.forwardedTo : [],
    received_at: msg.receivedAt
      ? String(msg.receivedAt).slice(0, 10)
      : null,
    status: STATUS_TO_UI[msg.status] || "New",
    is_sample: false,
    created_at: msg.receivedAt
      ? String(msg.receivedAt).slice(0, 10)
      : "",
  };
}

export function messageToFormData(form) {
  const type =
    TYPE_TO_API[form.type] ||
    (form.type === "contact" || form.type === "inquiry"
      ? form.type
      : "inquiry");

  const payload = {
    type,
    name: String(form.name || "").trim(),
    company: String(form.company || "").trim() || null,
    email: String(form.email || "").trim(),
    mobile: String(form.mobile || "").trim() || null,
    city: String(form.city || "").trim() || null,
    subject: String(form.subject || "").trim(),
    message: String(form.body || form.message || "").trim(),
    targetCompany: form.target_company || GROUP_VALUE,
  };

  const fd = new FormData();
  fd.append("payload", JSON.stringify(payload));

  const files = form.attachmentFiles || [];
  for (const item of files) {
    const file = item?.file || item;
    if (file instanceof File) fd.append("attachments", file);
  }

  return fd;
}

export function messageStatusToApi(status) {
  return STATUS_TO_API[status] || status;
}
