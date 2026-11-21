"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "@/components/shared/FileUpload";
import api, { getApiErrorMessage } from "@/app/api/api";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";
export default function PageImageUpload({ slug, value, onChange, onBusy, title, maxBytes = 10485760, accept }) {
  const { isRtl } = useI18n(); const [busy, setBusy] = useState(false);
  const url = value ? `${String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "")}/uploads/${value}` : "";
  const change = async files => {
    if (!files.length) { onChange(""); return; }
    const file = files[0].file;
    if (!file || file.size > maxBytes) { toast.error(isRtl ? `حجم الصورة يجب ألا يتجاوز ${Math.round(maxBytes / 1048576)} ميجابايت` : `Image must be at most ${Math.round(maxBytes / 1048576)} MB`); return; }
    setBusy(true); onBusy?.(true);
    try { const result = await uploadPageMedia(slug, file, "image"); if (!result?.path) throw new Error(); onChange(result.path); }
    catch (error) { toast.error(getApiErrorMessage(error, isRtl ? "تعذر رفع الصورة" : "Image upload failed")); }
    finally { setBusy(false); onBusy?.(false); }
  };
  const size = Math.round(maxBytes / 1048576);
  const effectiveAccept = accept || {"image/png":[".png"],"image/jpeg":[".jpg",".jpeg"],"image/webp":[".webp"],"image/gif":[".gif"],"image/bmp":[".bmp"]};
  const formats = [...new Set(Object.values(effectiveAccept).flat().map(ext => ext.replace(/^\./, "").toUpperCase()))].join(", ");
  return <div aria-busy={busy}><FileUpload title={title} hint={isRtl ? `صور ${formats} حتى ${size} ميجابايت` : `${formats} images up to ${size} MB`} maxFiles={1} accept={effectiveAccept} files={url ? [{ name: value.split("/").pop(), type: "image/" + (value.endsWith(".jpg") ? "jpeg" : value.split(".").pop()), preview: url }] : []} onFilesChange={change} /></div>;
}
