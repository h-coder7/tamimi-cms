"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import PageHeader from "@/components/layout/PageHeader";
import FileUpload from "@/components/shared/FileUpload";
import { useI18n } from "@/hooks/useI18n";
import { useCmsPage, useCmsPages, useUpdateCmsPage, uploadPageMedia } from "@/hooks/useCmsPages";
import api, { getApiErrorMessage } from "@/app/api/api";
import { defaultContent, pageMeta } from "./data";

const textValue = (v, lang) => typeof v === "string" ? (lang === "en" ? v : "") : v?.[lang] || "";
const hasText = v => Boolean(textValue(v, "en").trim() || textValue(v, "ar").trim());
export default function CallToActionEditor() {
  const { t, isRtl } = useI18n();
  const labels = isRtl ? { title: "قسم الدعوة إلى الإجراء", text: "نص القسم", small: "العنوان الصغير", main: "العنوان الرئيسي", button: "الزر", buttonText: "نص الزر", pdf: "ملف PDF للزر", hint: "ملف PDF فقط، حتى 10 ميجابايت", required: "أكمل العناوين ونص الزر وأرفق ملف PDF.", failed: "تعذر رفع الملف", invalid: "اختر ملف PDF صالحاً لا يتجاوز 10 ميجابايت." } : { title: "Call to Action Section", text: "Section text", small: "Small heading", main: "Main heading", button: "Button", buttonText: "Button text", pdf: "Button PDF", hint: "PDF only, up to 10 MB", required: "Complete both headings, button text and attach a PDF.", failed: "PDF upload failed", invalid: "Choose a PDF file up to 10 MB." };
  const router = useRouter();
  const { data: page, isLoading } = useCmsPage(pageMeta.id);
  const { data: pages = [] } = useCmsPages();
  const update = useUpdateCmsPage();
  const [draft, setDraft] = useState(null);
  const content = draft || { ...defaultContent.content, ...(page?.content?.content || {}) };
  const [uploading, setUploading] = useState(false);
  const setField = (key, val) => setDraft(prev => ({ ...(prev || content), [key]: val }));
  const fields = (label, key, max) => <div className="mb-3"><label className="form-label fsz-12 text-muted">{label} <span className="text-danger">*</span></label><div className="row g-2">{["en", "ar"].map(lang => <div className="col-md-6" key={lang}><span className="fsz-10 text-muted">{lang.toUpperCase()}</span><input className="form-control" dir={lang === "ar" ? "rtl" : "ltr"} maxLength={max} value={textValue(content[key], lang)} onChange={e => setField(key, { en: textValue(content[key], "en"), ar: textValue(content[key], "ar"), [lang]: e.target.value })} /></div>)}</div></div>;
  const changePdf = async files => {
    if (!files.length) { setField("button_pdf", ""); return; }
    const file = files[0].file;
    if (!file || file.type !== "application/pdf" || !/\.pdf$/i.test(file.name) || file.size > 10485760) { toast.error(labels.invalid); return; }
    setUploading(true);
    try { const result = await uploadPageMedia("call-to-action", file, "cta_pdf"); if (!result?.path) throw new Error(labels.failed); setField("button_pdf", result.path); }
    catch (error) { toast.error(getApiErrorMessage(error, labels.failed)); }
    finally { setUploading(false); }
  };
  const save = async () => {
    if (!hasText(content.small_heading) || !hasText(content.main_heading) || !hasText(content.button_text) || !content.button_pdf) { toast.error(labels.required); return; }
    try { await update.mutateAsync({ ...page, content: { ...(page.content || {}), content }, status: "Published" }); router.push("/dashboard/pages"); } catch { /* Mutation reports the server error. */ }
  };
  if (isLoading) return <div className="text-center py-5 text-muted">{t("pages.loadingEditor")}</div>;
  if (!page) return <div className="text-center py-5">{t("pages.notFound")}</div>;
  const url = content.button_pdf ? `${String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "")}/uploads/${content.button_pdf}` : "";
  return <><PageHeader title={t("pages.editTitle", { page: labels.title })} icon="fal fa-file-edit" titleCol="col-lg-6" actionCol="col-lg-6"><button type="button" className="alert alert-light rounded-pill py-2 px-3 fsz-12 ms-2 border mb-0" onClick={() => router.push("/dashboard/pages")}>{t("common.cancel")}</button><button type="button" className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0" disabled={uploading || update.isPending} onClick={save}>{t("pages.savePublish")}</button></PageHeader><div className="page-editor mt-4"><aside className="page-editor__sidebar table-content p-0 mt-0 mb-0"><div className="page-editor__sidebar-head"><h6 className="mb-0 fsz-13 fw-600">{isRtl ? "كل الصفحات" : "All pages"}</h6></div><div className="page-editor__sections">{pages.filter(item => item.id).map(item => <Link key={item.id} href={`/dashboard/pages/${item.id}/edit/`} className={`page-editor__section-item ${item.id === pageMeta.id ? "active" : ""}`}><span className="page-editor__section-title">{item.id === pageMeta.id ? labels.title : item.page}</span><i className="fal fa-angle-right text-muted"></i></Link>)}</div></aside><section className="page-editor__main table-content mt-0 mb-0"><div className="page-editor__main-head"><h6 className="mb-0 fsz-14 fw-600">{labels.title}</h6><span className="fsz-12 text-muted">{t("pages.editableFields", { count: 4 })}</span></div><div className="page-editor__fields"><h6 className="mb-3">{labels.text}</h6>{fields(labels.small, "small_heading", 80)}{fields(labels.main, "main_heading", 140)}<div className="border-top pt-3"><h6 className="mb-3">{labels.button}</h6>{fields(labels.buttonText, "button_text", 60)}<FileUpload title={labels.pdf} hint={labels.hint} maxFiles={1} accept={{ "application/pdf": [".pdf"] }} files={url ? [{ name: content.button_pdf.split("/").pop(), type: "application/pdf", preview: url }] : []} onFilesChange={changePdf} /></div></div></section></div></>;
}
