"use client";
import { useRef } from "react";
import toast from "react-hot-toast";
import FileUpload from "@/components/shared/FileUpload";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import api, { getApiErrorMessage } from "@/app/api/api";
import { useI18n } from "@/hooks/useI18n";

const hasText = v => typeof v === "string" ? !!v.trim() : !!(v?.en?.trim() || v?.ar?.trim());
const validUrl = v => { if (!v) return true; try { return ["http:", "https:"].includes(new URL(v).protocol); } catch { return false; } };
export function validateTeam(team = {}) {
  return hasText(team.title) && hasText(team.description) && hasText(team.chairman?.label) && hasText(team.chairman?.description) && (team.members || []).every(m => hasText(m.name) && hasText(m.position) && ["x", "facebook", "tiktok"].every(k => validUrl(m.social?.[k])));
}
export default function TeamEditor({ value, onChange, onUploading }) {
  const { isRtl } = useI18n();
  const l = isRtl ? { title: "العنوان", description: "الوصف", chairman: "بطاقة رئيس مجلس الإدارة", fixed: "تظهر دائماً ولا يمكن حذفها", label: "العنوان فوق الرسالة", secondary: "الوصف الإضافي", name: "الاسم", position: "المنصب", members: "أعضاء الفريق", add: "إضافة عضو", member: "عضو", remove: "حذف", confirm: "هل تريد حذف هذا العضو؟", up: "تحريك لأعلى", down: "تحريك لأسفل", photo: "الصورة", hint: "JPG أو PNG أو WebP، حتى 2 ميجابايت.", social: "روابط التواصل الاجتماعي (اختياري)", failed: "تعذر رفع الصورة", size: "اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 2 ميجابايت." } : { title: "Title", description: "Description", chairman: "Chairman card", fixed: "Always shown, cannot be deleted", label: "Label above the message", secondary: "Secondary description", name: "Name", position: "Job position", members: "Team members", add: "Add member", member: "Member", remove: "Delete", confirm: "Delete this team member?", up: "Move up", down: "Move down", photo: "Photo", hint: "JPG, PNG or WebP, up to 2 MB. Shown in black and white on the page.", social: "Social media links (optional)", failed: "Image upload failed", size: "Choose a JPG, PNG or WebP image up to 2 MB." };
  const uploads = useRef(0);
  const update = patch => onChange(current => ({ ...current, ...(typeof patch === "function" ? patch(current) : patch) }));
  const chairman = value.chairman || {}, members = value.members || [];
  const setChairman = patch => update(current => ({ chairman: { ...(current.chairman || {}), ...patch } }));
  const setMember = (index, patch) => update(current => ({ members: (current.members || []).map((m, i) => i === index ? { ...m, ...patch } : m) }));
  const textValue = (v, lang) => typeof v === "string" ? (lang === "en" ? v : "") : (v?.[lang] || "");
  const field = (label, val, change, max, multiline = false, required = false) => <div className="mb-3"><label className="form-label fsz-12 text-muted">{label}{required && <span className="text-danger"> *</span>}</label><div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span>{multiline ? <textarea className="form-control" rows={3} dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={textValue(val, lang)} onChange={e => change({ en: textValue(val, "en"), ar: textValue(val, "ar"), [lang]: e.target.value })} /> : <input className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={textValue(val, lang)} onChange={e => change({ en: textValue(val, "en"), ar: textValue(val, "ar"), [lang]: e.target.value })} />}</div>)}</div></div>;
  const imageUrl = path => !path ? "" : /^(https?:|\/)/.test(path) ? path : `${String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "")}/uploads/${path}`;
  const photo = (path, apply) => <FileUpload title={l.photo} hint={l.hint} maxFiles={1} accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }} files={path ? [{ name: path.split("/").pop(), type: "image/jpeg", preview: imageUrl(path) }] : []} onFilesChange={async files => {
    if (!files.length) { apply(""); return; }
    const file = files[0].file;
    if (!file || file.size > 2097152 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error(l.size); return; }
    uploads.current += 1; onUploading(true);
    try { const result = await uploadPageMedia("group-history", file, "team_image"); if (!result?.path) throw new Error(l.failed); apply(result.path); }
    catch (error) { toast.error(getApiErrorMessage(error, l.failed)); }
    finally { uploads.current -= 1; onUploading(uploads.current > 0); }
  }} />;
  const move = (i, delta) => { const next = [...members], j = i + delta; if (j < 0 || j >= next.length) return; [next[i], next[j]] = [next[j], next[i]]; update({ members: next }); };
  return <div>
    {field(l.title, value.title, v => update({ title: v }), 120, false, true)}
    {field(l.description, value.description, v => update({ description: v }), 240, true, true)}
    <div className="border-top pt-3 mb-4"><div className="d-flex justify-content-between mb-3"><h6>{l.chairman}</h6><span className="text-muted fsz-12">{l.fixed}</span></div><div className="row g-3"><div className="col-md-4">{photo(chairman.image, image => setChairman({ image }))}</div><div className="col-md-8">
      {field(l.label, chairman.label, v => setChairman({ label: v }), 120, false, true)}{field(l.description, chairman.description, v => setChairman({ description: v }), 220, true, true)}{field(l.secondary, chairman.secondary_description, v => setChairman({ secondary_description: v }), 200, true)}{field(l.name, chairman.name, v => setChairman({ name: v }), 120)}{field(l.position, chairman.position, v => setChairman({ position: v }), 120)}
    </div></div></div>
    <div className="border-top pt-3"><div className="d-flex justify-content-between align-items-center mb-3"><h6>{l.members} <span className="text-muted">({members.length})</span></h6><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => update({ members: [...members, { id: crypto.randomUUID(), image: "", name: { en: "", ar: "" }, position: { en: "", ar: "" }, social: {} }] })}>+ {l.add}</button></div><div className="row g-3">{members.map((m, i) => <div className="col-lg-4 col-md-6" key={m.id || i}><div className="border rounded-3 p-3 h-100"><div className="d-flex justify-content-between mb-3"><span>{l.member} {i + 1}</span><button type="button" className="btn btn-link text-danger p-0 fsz-12" onClick={() => { if (window.confirm(l.confirm)) update({ members: members.filter((_, n) => n !== i) }); }}>{l.remove}</button></div>
      {photo(m.image, image => update(current => ({ members: (current.members || []).map((item, n) => (m.id ? item.id === m.id : n === i) ? { ...item, image } : item) })))}{field(l.name, m.name, v => setMember(i, { name: v }), 120, false, true)}{field(l.position, m.position, v => setMember(i, { position: v }), 120, false, true)}
      <div className="border-top pt-3"><p className="fsz-12 text-muted">{l.social}</p>{["x", "facebook", "tiktok"].map(k => <div className="mb-2" key={k}><label className="form-label fsz-12 text-muted">{k === "x" ? "X" : k === "facebook" ? "Facebook" : "TikTok"}</label><input type="url" dir="ltr" className="form-control" maxLength={2048} value={m.social?.[k] || ""} onChange={e => setMember(i, { social: { ...(m.social || {}), [k]: e.target.value } })} /></div>)}</div><div className="d-flex gap-2 mt-3"><button type="button" className="btn btn-outline-secondary btn-sm" disabled={!i} onClick={() => move(i, -1)}>{l.up}</button><button type="button" className="btn btn-outline-secondary btn-sm" disabled={i === members.length - 1} onClick={() => move(i, 1)}>{l.down}</button></div>
    </div></div>)}</div></div>
  </div>;
}
