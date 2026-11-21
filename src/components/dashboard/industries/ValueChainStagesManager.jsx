"use client";

import { useEffect, useState } from "react";
import api from "@/app/api/api";
import { useI18n } from "@/hooks/useI18n";
import toast from "react-hot-toast";

export default function ValueChainStagesManager({ isOpen, onClose }) {
  const { isRtl } = useI18n();
  const ar = isRtl;
  const [stages, setStages] = useState([]);
  const [draft, setDraft] = useState({ en: "", ar: "" });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const res = await api.get("/industries/value-chain-stages");
    setStages(res.data?.data || []);
  };
  useEffect(() => { if (isOpen) load().catch(() => toast.error(ar ? "تعذر تحميل المراحل" : "Could not load stages")); }, [isOpen]);
  if (!isOpen) return null;
  const save = async (event) => {
    event.preventDefault();
    if (!draft.en.trim() || !draft.ar.trim()) return toast.error(ar ? "أدخل الاسم باللغتين" : "Enter both English and Arabic names");
    setBusy(true);
    try {
      if (editing) await api.patch(`/industries/value-chain-stages/${editing}`, { name: draft });
      else await api.post("/industries/value-chain-stages", { name: draft });
      setDraft({ en: "", ar: "" }); setEditing(null); await load();
    } catch (error) { toast.error(error?.response?.data?.message || (ar ? "تعذر الحفظ" : "Could not save stage")); }
    finally { setBusy(false); }
  };
  const remove = async (stage) => {
    setBusy(true);
    try {
      const deps = await api.get(`/industries/value-chain-stages/${stage.id}/dependencies`);
      const industries = deps.data?.data?.industries || [];
      const companies = deps.data?.data?.companies || [];
      const total = industries.length + companies.length;
      if (total && !window.confirm(ar ? `هذه المرحلة مستخدمة في ${industries.length} قطاعات و${companies.length} شركات. حذفها سيزيلها منها. متابعة؟` : `This stage is used by ${industries.length} industries and ${companies.length} companies. Deleting it will remove it from them. Continue?`)) return;
      await api.delete(`/industries/value-chain-stages/${stage.id}`, { params: { confirm: total ? "true" : "false" } });
      await load();
    } catch (error) { toast.error(error?.response?.data?.message || (ar ? "تعذر الحذف" : "Could not delete stage")); }
    finally { setBusy(false); }
  };
  const move = async (index, delta) => {
    const next = [...stages]; const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    try { await api.put("/industries/value-chain-stages/order", { ids: next.map((item) => item.id) }); await load(); }
    catch (error) { toast.error(error?.response?.data?.message || (ar ? "تعذر تغيير الترتيب" : "Could not reorder stages")); }
    finally { setBusy(false); }
  };
  return <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: "#0008", zIndex: 1060 }}><div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">{ar ? "مراحل سلسلة القيمة" : "Value Chain Stages"}</h5><button className="btn-close" onClick={onClose} aria-label="Close" /></div><div className="modal-body">
    <form onSubmit={save} className="row g-2 mb-4"><div className="col-md-5"><input className="form-control" dir="ltr" maxLength={120} placeholder="English name" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} required /></div><div className="col-md-5"><input className="form-control" dir="rtl" maxLength={120} placeholder="الاسم بالعربية" value={draft.ar} onChange={(e) => setDraft({ ...draft, ar: e.target.value })} required /></div><div className="col-md-2 d-flex gap-1"><button className="btn btn-primary" disabled={busy}>{editing ? (ar ? "تحديث" : "Update") : (ar ? "إضافة" : "Add")}</button>{editing && <button type="button" className="btn btn-light" onClick={() => { setEditing(null); setDraft({ en: "", ar: "" }); }}>×</button>}</div></form>
    <div className="list-group">{stages.map((stage, index) => <div className="list-group-item d-flex align-items-center justify-content-between gap-2" key={stage.id}><div><strong>{stage.name?.en}</strong><div dir="rtl" className="text-muted">{stage.name?.ar}</div></div><div className="d-flex gap-1"><button className="btn btn-sm btn-outline-secondary" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label="Move up">↑</button><button className="btn btn-sm btn-outline-secondary" disabled={busy || index === stages.length - 1} onClick={() => move(index, 1)} aria-label="Move down">↓</button><button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => { setEditing(stage.id); setDraft({ en: stage.name?.en || "", ar: stage.name?.ar || "" }); }}>{ar ? "تعديل" : "Edit"}</button><button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => remove(stage)}>{ar ? "حذف" : "Delete"}</button></div></div>)}</div>
  </div><div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>{ar ? "إغلاق" : "Close"}</button></div></div></div></div>;
}
