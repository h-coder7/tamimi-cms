"use client";
import PageImageUpload from "../_shared/PageImageUpload";
import { useI18n } from "@/hooks/useI18n";

const empty = () => ({ main_heading: { en: "", ar: "" }, description: { en: "", ar: "" }, secondary_description: { en: "", ar: "" }, stats: Array.from({ length: 3 }, () => ({ title: { en: "", ar: "" }, value: "" })) });
const valueFor = (value, lang) => typeof value === "string" ? (lang === "en" ? value : "") : value?.[lang] || "";
export const isValidStory = value => ["main_heading", "description", "secondary_description"].every(key => ["en", "ar"].some(lang => valueFor(value?.[key], lang).trim())) && Array.isArray(value?.stats) && value.stats.length === 3 && value.stats.every(item => ["en", "ar"].some(lang => valueFor(item.title, lang).trim()) && /^[0-9٠-٩۰-۹][0-9٠-٩۰-۹.,،+%٪\s]*$/.test(String(item.value || "").trim()));

export default function OurStoryEditor({ value, onChange, onBusy }) {
  const { isRtl } = useI18n();
  const labels = isRtl ? { heading: "العنوان الرئيسي", description: "الوصف", secondary: "الوصف الإضافي", stats: "الإحصاءات", fixed: "3 بطاقات ثابتة", title: "عنوان البطاقة", number: "القيمة الرقمية", image: "صورة النظرة العامة", limit: "اختر JPG أو PNG أو WEBP حتى 5 ميجابايت" } : { heading: "Main heading", description: "Description", secondary: "Secondary description", stats: "Statistics", fixed: "3 fixed cards", title: "Card title", number: "Number value", image: "Overview image", limit: "Choose JPG, PNG or WEBP up to 5 MB" };
  const data = { ...empty(), ...(value || {}) };
  const stats = Array.isArray(data.stats) ? data.stats : empty().stats;
  const update = patch => onChange({ ...data, ...patch });
  const field = (label, key, max, multiline = false) => <div className="mb-3"><label className="form-label fsz-12 text-muted">{label}</label><div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span>{multiline ? <textarea className="form-control" rows={3} dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={valueFor(data[key], lang)} onChange={e => update({ [key]: { en: valueFor(data[key], "en"), ar: valueFor(data[key], "ar"), [lang]: e.target.value } })} /> : <input className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={valueFor(data[key], lang)} onChange={e => update({ [key]: { en: valueFor(data[key], "en"), ar: valueFor(data[key], "ar"), [lang]: e.target.value } })} />}</div>)}</div></div>;
  const image = data.image || "";
  return <>
    {field(labels.heading, "main_heading", 120)}
    {field(labels.description, "description", 450, true)}
    {field(labels.secondary, "secondary_description", 220, true)}
    <PageImageUpload slug="about" value={image} onChange={image => update({ image })} onBusy={onBusy} title={labels.image} maxBytes={5 * 1024 * 1024} accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }} />
    <div className="border-top pt-3"><div className="d-flex justify-content-between mb-3"><h6>{labels.stats}</h6><span className="fsz-12 text-muted">{labels.fixed}</span></div><div className="row g-3">{Array.from({ length: 3 }, (_, index) => { const item = stats[index] || { title: { en: "", ar: "" }, value: "" }; const set = (key, v) => update({ stats: Array.from({ length: 3 }, (_, i) => i === index ? { ...item, [key]: v } : (stats[i] || { title: { en: "", ar: "" }, value: "" })) }); return <div className="col-md-4" key={index}><div className="border rounded-3 p-3"><h6>Card {index + 1}</h6><label className="form-label fsz-12">{labels.title}</label>{["en", "ar"].map(lang => <input key={lang} className="form-control mb-2" aria-label={`${labels.title} ${lang}`} dir={lang === "ar" ? "rtl" : "ltr"} maxLength={60} value={valueFor(item.title, lang)} onChange={e => set("title", { en: valueFor(item.title, "en"), ar: valueFor(item.title, "ar"), [lang]: e.target.value })} />)}<label className="form-label fsz-12">{labels.number}</label><input className="form-control" dir="ltr" maxLength={16} value={item.value || ""} onChange={e => set("value", e.target.value)} /></div></div>; })}</div></div>
  </>;
}
