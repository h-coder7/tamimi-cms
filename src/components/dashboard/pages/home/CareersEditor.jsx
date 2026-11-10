"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "@/components/shared/FileUpload";
import api, { getApiErrorMessage } from "@/app/api/api";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";

export default function CareersEditor({ value, onChange, onUploading }) {
  const { isRtl } = useI18n();
  const [tab, setTab] = useState("intro");
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const latest = useRef(value);
  latest.current = value;
  const labels = isRtl ? {
    intro: "المقدمة", highlights: "أبرز الملامح", name: "اسم القسم", title: "عنوان القسم", description: "الوصف", image: "صورة القسم", hint: "صورة أفقية بعرض 1200 بكسل على الأقل", areas: "مجالات التركيز", add: "إضافة بطاقة", up: "تحريك لأعلى", down: "تحريك لأسفل", delete: "حذف", confirm: "هل تريد حذف هذه البطاقة؟", numbers: "الأرقام", value: "القيمة", label: "التسمية", show: "عرض المعاينة", hide: "إخفاء المعاينة", preview: "معاينة مباشرة", uploading: "جارٍ رفع الصورة...", failed: "تعذر رفع الصورة"
  } : {
    intro: "Intro", highlights: "Highlights", name: "Section name", title: "Section title", description: "Description", image: "Section image", hint: "Landscape image, at least 1200 pixels wide", areas: "Focus Areas", add: "+ Add card", up: "Move Up", down: "Move Down", delete: "Delete", confirm: "Delete this card?", numbers: "Numbers", value: "Value", label: "Label", show: "Show Preview", hide: "Hide Preview", preview: "Live Preview", uploading: "Uploading image...", failed: "Image upload failed"
  };
  const update = (patch) => onChange({ ...latest.current, ...patch });
  const updateCard = (index, patch) => update({ focus_areas: latest.current.focus_areas.map((card, i) => i === index ? { ...card, ...patch } : card) });
  const move = (index, delta) => {
    const cards = [...latest.current.focus_areas];
    const target = index + delta;
    if (target < 0 || target >= cards.length) return;
    [cards[index], cards[target]] = [cards[target], cards[index]];
    update({ focus_areas: cards });
  };
  const changeImage = async (files) => {
    if (!files.length) { update({ image: "" }); return; }
    if (!files[0].file) return;
    setUploading(true); onUploading(true);
    try {
      const result = await uploadPageMedia("home", files[0].file, "careers_image");
      if (!result?.path) throw new Error(labels.failed);
      update({ image: result.path });
    } catch (error) { toast.error(getApiErrorMessage(error, labels.failed)); }
    finally { setUploading(false); onUploading(false); }
  };
  const imageUrl = value.image ? `${String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "")}/uploads/${value.image}` : "";
  const field = (label, val, change, multiline = false) => <div className="mb-3"><label className="form-label fsz-12 text-muted">{label}</label>{multiline ? <textarea dir={isRtl ? "rtl" : "ltr"} className="form-control" rows={4} maxLength={4000} value={val} onChange={e => change(e.target.value)} /> : <input dir={isRtl ? "rtl" : "ltr"} className="form-control" maxLength={300} value={val} onChange={e => change(e.target.value)} />}</div>;
  return <div className="our-history-scope">
    <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
      <div className="d-flex gap-2">
        <button type="button" className={`oh-tab ${tab === "intro" ? "active" : ""}`} onClick={() => setTab("intro")}>{labels.intro}</button>
        <button type="button" className={`oh-tab ${tab === "highlights" ? "active" : ""}`} onClick={() => setTab("highlights")}>{labels.highlights}</button>
      </div>
      <button type="button" className={`oh-preview-toggle-btn ${preview ? "active" : ""}`} onClick={() => setPreview(!preview)}>{preview ? labels.hide : labels.show}</button>
    </div>
    {tab === "intro" ? <>
      {field(labels.name, value.section_name, v => update({ section_name: v }))}
      {field(labels.title, value.section_title, v => update({ section_title: v }))}
      {field(labels.description, value.description, v => update({ description: v }), true)}
      <FileUpload title={labels.image} hint={uploading ? labels.uploading : labels.hint} files={imageUrl ? [{ name: value.image.split("/").pop(), type: "image/jpeg", preview: imageUrl }] : []} onFilesChange={changeImage} maxFiles={1} accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"], "image/gif": [".gif"], "image/bmp": [".bmp"] }} />
    </> : <>
      <h6>{labels.areas}</h6>
      {value.focus_areas.map((card, i) => <div className="border rounded-3 p-3 mb-3" key={card.id}>
        {field(labels.title, card.title, v => updateCard(i, { title: v }))}
        {field(labels.description, card.description, v => updateCard(i, { description: v }), true)}
        <div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-secondary btn-sm" disabled={i === 0} onClick={() => move(i, -1)}>{labels.up}</button><button type="button" className="btn btn-outline-secondary btn-sm" disabled={i === value.focus_areas.length - 1} onClick={() => move(i, 1)}>{labels.down}</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => { if (window.confirm(labels.confirm)) update({ focus_areas: latest.current.focus_areas.filter(c => c.id !== card.id) }); }}>{labels.delete}</button></div>
      </div>)}
      <button type="button" className="btn btn-outline-primary btn-sm mb-4" disabled={value.focus_areas.length >= 100} onClick={() => update({ focus_areas: [...latest.current.focus_areas, { id: `focus-${crypto.randomUUID()}`, title: "", description: "" }] })}>{labels.add}</button>
      <h6>{labels.numbers}</h6>
      {value.statistics.map((stat, i) => <div className="border rounded-3 p-3 mb-3" key={i}>{field(`${labels.value} ${i + 1}`, stat.value, v => update({ statistics: latest.current.statistics.map((s, n) => n === i ? { ...s, value: v } : s) }))}{field(`${labels.label} ${i + 1}`, stat.label, v => update({ statistics: latest.current.statistics.map((s, n) => n === i ? { ...s, label: v } : s) }))}</div>)}
    </>}
    {preview && <div className="oh-public-preview mt-4 p-4 border rounded-3" aria-label={labels.preview}><h6>{labels.preview}</h6><p>{value.section_name}</p><h2>{value.section_title}</h2><p>{value.description}</p>{imageUrl && <img src={imageUrl} alt="" className="img-fluid rounded mb-3" />}<div className="row">{value.focus_areas.map(card => <div className="col-md-6 mb-3" key={card.id}><div className="border rounded p-3 h-100"><h5>{card.title}</h5><p>{card.description}</p></div></div>)}</div><div className="d-flex gap-4">{value.statistics.map((stat, i) => <div key={i}><strong>{stat.value}</strong><p>{stat.label}</p></div>)}</div></div>}
  </div>;
}
