"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "@/components/shared/FileUpload";
import api, { getApiErrorMessage } from "@/app/api/api";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";
export default function PageImageUpload({ slug, value, onChange, onBusy, title }) {
  const { isRtl } = useI18n(); const [busy, setBusy] = useState(false);
  const url = value ? `${String(api.defaults.baseURL || "").replace(/\/api\/v1\/admin\/?$/, "")}/uploads/${value}` : "";
  const change = async files => {
    if (!files.length) { onChange(""); return; }
    const file = files[0].file;
    if (!file || file.size > 10485760) { toast.error(isRtl ? "الصورة كبيرة جداً" : "Image must be at most 10 MB"); return; }
    setBusy(true); onBusy?.(true);
    try { const result = await uploadPageMedia(slug, file, "image"); if (!result?.path) throw new Error(); onChange(result.path); }
    catch (error) { toast.error(getApiErrorMessage(error, isRtl ? "تعذر رفع الصورة" : "Image upload failed")); }
    finally { setBusy(false); onBusy?.(false); }
  };
  return <div aria-busy={busy}><FileUpload title={title} hint={isRtl ? "صور PNG أو JPG أو WEBP أو GIF أو BMP، حتى 10 ميجابايت" : "PNG, JPG, WEBP, GIF or BMP, up to 10 MB"} maxFiles={1} accept={{"image/png":[".png"],"image/jpeg":[".jpg",".jpeg"],"image/webp":[".webp"],"image/gif":[".gif"],"image/bmp":[".bmp"]}} files={url ? [{ name: value.split("/").pop(), type: "image/" + (value.endsWith(".jpg") ? "jpeg" : value.split(".").pop()), preview: url }] : []} onFilesChange={change} /></div>;
}
