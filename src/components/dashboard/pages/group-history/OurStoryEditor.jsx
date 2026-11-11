"use client";
import { useI18n } from "@/hooks/useI18n";
const empty = () => ({ main_heading: { en: "", ar: "" }, cards: Array.from({ length: 4 }, () => ({ title: { en: "", ar: "" }, value: "" })) });
const hasText = v => typeof v === "string" ? Boolean(v.trim()) : Boolean(v?.en?.trim() || v?.ar?.trim());
export const isValidStory = value => hasText(value?.main_heading) && Array.isArray(value?.cards) && value.cards.length === 4 && value.cards.every(card => hasText(card.title) && typeof card.value === "string" && card.value.length <= 16 && /^[0-9٠-٩۰-۹][0-9٠-٩۰-۹.,،+%٪\s]*$/.test(card.value.trim()));
const localized = (value, lang) => typeof value === "string" ? (lang === "en" ? value : "") : value?.[lang] || "";
export default function OurStoryEditor({ value, onChange }) {
  const { isRtl } = useI18n();
  const l = isRtl ? { heading: "العنوان الرئيسي", cards: "بطاقات الإحصاءات", fixed: "٤ بطاقات ثابتة", card: "البطاقة", title: "عنوان البطاقة", number: "القيمة الرقمية" } : { heading: "Main heading", cards: "Statistics cards", fixed: "4 fixed cards", card: "Card", title: "Card title", number: "Number value" };
  const data = value || empty();
  const cards = Array.isArray(data.cards) ? data.cards : empty().cards;
  const input = (label, val, change, max) => <div className="mb-3"><label className="form-label fsz-12 text-muted">{label} <span className="text-danger">*</span></label><div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><input className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={localized(val, lang)} onChange={e => change({ en: localized(val, "en"), ar: localized(val, "ar"), [lang]: e.target.value })} /></div>)}</div></div>;
  return <>
    {input(l.heading, data.main_heading, main_heading => onChange({ ...data, main_heading }), 120)}
    <div className="border-top pt-3"><div className="d-flex justify-content-between mb-3"><h6>{l.cards}</h6><span className="fsz-12 text-muted">{l.fixed}</span></div><div className="row g-3">{Array.from({ length: 4 }, (_, i) => { const card = cards[i] || { title: { en: "", ar: "" }, value: "" }; const update = patch => onChange({ ...data, cards: Array.from({ length: 4 }, (_, n) => n === i ? { ...card, ...patch } : (cards[n] || { title: { en: "", ar: "" }, value: "" })) }); return <div className="col-md-6" key={i}><div className="border rounded-3 p-3 h-100"><h6 className="fsz-13 mb-3">{l.card} {i + 1}</h6>{input(l.title, card.title, title => update({ title }), 60)}<label className="form-label fsz-12 text-muted">{l.number} <span className="text-danger">*</span></label><input className="form-control" dir="ltr" inputMode="text" maxLength={16} value={card.value || ""} onChange={e => update({ value: e.target.value })} /></div></div>; })}</div></div>
  </>;
}
