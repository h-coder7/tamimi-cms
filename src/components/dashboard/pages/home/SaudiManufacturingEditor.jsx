"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import { publicPath } from "@/utils/publicPath";
import { TT19_ICONS } from "./tt19-icons";
import "./saudi-manufacturing.css";

export { TT19_ICONS };

export function SvgIcon({ iconKey, className = "i", style = {} }) {
  const iconData = TT19_ICONS[iconKey] || TT19_ICONS.factory;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "1em", height: "1em", flex: "none", ...style }}
      dangerouslySetInnerHTML={{ __html: iconData.path }}
      aria-hidden="true"
    />
  );
}

function fmtSize(b) {
  if (!b || isNaN(b)) return "";
  return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
}

function normalizeState(data = {}) {
  const defaultFeatures = [
    { id: 1, title: { en: "Local Manufacturing Capacity", ar: "قدرات التصنيع المحلي" }, icon: "factory" },
    { id: 2, title: { en: "Technology Transfer", ar: "نقل التقنية" }, icon: "cpu" },
    { id: 3, title: { en: "Saudi Workforce Development", ar: "تطوير الكوادر السعودية" }, icon: "users" },
    { id: 4, title: { en: "Resilient Local Supply Chains", ar: "سلاسل إمداد محلية مرنة" }, icon: "truck" }
  ];

  const rawFeatures = Array.isArray(data.features) ? data.features : [];
  const mergedFeatures = defaultFeatures.map((df, idx) => {
    const found = rawFeatures.find((f) => f.id === df.id) || rawFeatures[idx] || {};
    return {
      id: df.id,
      title: {
        en: found.title?.en ?? (typeof found.title === "string" ? found.title : df.title.en),
        ar: found.title?.ar ?? df.title.ar,
      },
      icon: found.icon || df.icon || "factory",
    };
  });

  let imgObj = null;
  if (data.image) {
    if (typeof data.image === "object" && data.image.src) {
      imgObj = { ...data.image };
    } else if (typeof data.image === "string" && data.image.trim()) {
      imgObj = {
        src: publicPath(data.image),
        name: data.image.split("/").pop() || "Current image",
        meta: "Current image",
        path: data.image,
      };
    }
  }

  return {
    small_heading: {
      en: data.small_heading?.en ?? data.smallHeading?.en ?? (typeof data.small_heading === "string" ? data.small_heading : "Saudi Manufacturing & Localisation"),
      ar: data.small_heading?.ar ?? data.smallHeading?.ar ?? "التصنيع والتوطين السعودي",
    },
    main_heading: {
      en: data.main_heading?.en ?? data.mainHeading?.en ?? data.title?.en ?? (typeof data.main_heading === "string" ? data.main_heading : "Building in the Kingdom, for the Kingdom"),
      ar: data.main_heading?.ar ?? data.mainHeading?.ar ?? data.title?.ar ?? "نبني في المملكة، لأجل المملكة",
    },
    description: {
      en: data.description?.en ?? (typeof data.description === "string" ? data.description : "We design, build and localise industrial products and services inside Saudi Arabia, keeping engineering, manufacturing and know-how close to the projects they serve. Our approach supports Vision 2030 by growing local content, creating skilled Saudi jobs and strengthening supply chains."),
      ar: data.description?.ar ?? "نصمم ونصنّع ونوطّن المنتجات والخدمات الصناعية داخل المملكة العربية السعودية، مع الحفاظ على القرب من المشاريع التي تخدمها. يدعم نهجنا رؤية 2030 من خلال تنمية المحتوى المحلي وخلق وظائف نوعية وتعزيز سلاسل الإمداد.",
    },
    cta: {
      description: {
        en: data.cta?.description?.en ?? (typeof data.cta?.description === "string" ? data.cta.description : "Looking for a local manufacturing partner? Talk to our team about localising your next industrial project in the Kingdom."),
        ar: data.cta?.description?.ar ?? "هل تبحث عن شريك تصنيع محلي؟ تواصل مع فريقنا لتوطين مشروعك الصناعي القادم في المملكة.",
      },
      text: {
        en: data.cta?.text?.en ?? (typeof data.cta?.text === "string" ? data.cta.text : "Explore Manufacturing Capabilities"),
        ar: data.cta?.text?.ar ?? "استكشف قدرات التصنيع",
      },
      url: data.cta?.url ?? "/companies",
    },
    features: mergedFeatures.slice(0, 4),
    image: imgObj,
  };
}

export default function SaudiManufacturingEditor({
  initialData = {},
  onSave,
  isSaving = false,
}) {
  const [lang, setLang] = useState("en"); // "en" | "ar"
  const [cur, setCur] = useState(() => normalizeState(initialData));
  const [saved, setSaved] = useState(() => normalizeState(initialData));
  const [openGridIndex, setOpenGridIndex] = useState(null);
  const [imgMsg, setImgMsg] = useState({ text: "", kind: "" }); // kind: "err" | "warn" | ""
  const [errors, setErrors] = useState({});
  const [isArmed, setIsArmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const armTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeState(initialData);
    setCur(normalized);
    setSaved(normalized);
  }, [initialData]);

  // Signature check for dirty tracking
  const sig = useCallback((st) => JSON.stringify(st), []);
  const isDirty = sig(cur) !== sig(saved);

  const disarm = useCallback(() => {
    setIsArmed(false);
    if (armTimerRef.current) clearTimeout(armTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isDirty) disarm();
  }, [isDirty, disarm]);

  // Text change helpers
  const handleTextChange = (field, subfield, value) => {
    setErrors((prev) => ({ ...prev, [`${field}${subfield ? `_${subfield}` : ""}_${lang}`]: "" }));
    setCur((prev) => {
      if (subfield) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: {
              ...prev[field]?.[subfield],
              [lang]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      };
    });
  };

  const handleFeatureTitleChange = (index, value) => {
    setErrors((prev) => ({ ...prev, [`feature_${index}_${lang}`]: "" }));
    setCur((prev) => {
      const nextFeats = [...prev.features];
      nextFeats[index] = {
        ...nextFeats[index],
        title: {
          ...nextFeats[index].title,
          [lang]: value,
        },
      };
      return { ...prev, features: nextFeats };
    });
  };

  const handleFeatureIconChange = (index, iconKey) => {
    setCur((prev) => {
      const nextFeats = [...prev.features];
      nextFeats[index] = { ...nextFeats[index], icon: iconKey };
      return { ...prev, features: nextFeats };
    });
    setOpenGridIndex(null);
  };

  // Image upload handling
  const handleImageFile = async (file) => {
    if (!file) return;
    setImgMsg({ text: "", kind: "" });

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setImgMsg({ text: "That file type is not supported. Choose a JPG, PNG or WebP image.", kind: "err" });
      return;
    }
    if (file.size > 5 * 1048576) {
      setImgMsg({ text: "That image is larger than 5 MB. Choose a smaller file.", kind: "err" });
      return;
    }

    try {
      const imgPreview = URL.createObjectURL(file);
      const imgTest = new Image();
      imgTest.onload = async () => {
        const width = imgTest.naturalWidth;
        const height = imgTest.naturalHeight;

        let warning = "";
        if (width < 800) {
          warning = "This image is small and may look soft. Use one at least 1200 px wide for the sharpest result.";
          setImgMsg({ text: warning, kind: "warn" });
        }

        // Upload to backend media API
        try {
          const res = await uploadPageMedia("home", file, "image");
          const uploadedUrl = res.url || res.path || imgPreview;
          setCur((prev) => ({
            ...prev,
            image: {
              src: uploadedUrl,
              name: file.name,
              meta: `${fmtSize(file.size)} · ${width} × ${height} px`,
              path: res.path || uploadedUrl,
            },
          }));
          toast.success("Image uploaded successfully");
        } catch (uploadErr) {
          // If backend offline or error, preserve preview locally and warn
          setCur((prev) => ({
            ...prev,
            image: {
              src: imgPreview,
              name: file.name,
              meta: `${fmtSize(file.size)} · ${width} × ${height} px`,
            },
          }));
          toast.error(uploadErr?.message || "Could not upload image to server");
        }
      };
      imgTest.onerror = () => {
        setImgMsg({ text: "This image could not be read. Try another file.", kind: "err" });
      };
      imgTest.src = imgPreview;
    } catch (err) {
      setImgMsg({ text: "Error loading image file.", kind: "err" });
    }
  };

  const handleRemoveImage = () => {
    setCur((prev) => ({ ...prev, image: null }));
    setImgMsg({ text: "", kind: "" });
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    const checkLang = lang; // validate active language

    const small = cur.small_heading?.[checkLang] || "";
    if (!small.trim()) {
      errs[`small_heading_${checkLang}`] = "Enter the small heading.";
    } else if (small.length > 40) {
      errs[`small_heading_${checkLang}`] = "This is too long. Shorten it to 40 characters or fewer.";
    }

    const main = cur.main_heading?.[checkLang] || "";
    if (!main.trim()) {
      errs[`main_heading_${checkLang}`] = "Enter the main heading.";
    } else if (main.length > 80) {
      errs[`main_heading_${checkLang}`] = "This is too long. Shorten it to 80 characters or fewer.";
    }

    const desc = cur.description?.[checkLang] || "";
    if (!desc.trim()) {
      errs[`description_${checkLang}`] = "Enter the description.";
    } else if (desc.length > 380) {
      errs[`description_${checkLang}`] = "This is too long. Shorten it to 380 characters or fewer.";
    }

    const cta = cur.cta?.description?.[checkLang] || "";
    if (!cta.trim()) {
      errs[`cta_description_${checkLang}`] = "Enter the CTA description.";
    } else if (cta.length > 200) {
      errs[`cta_description_${checkLang}`] = "This is too long. Shorten it to 200 characters or fewer.";
    }

    cur.features.forEach((feat, idx) => {
      const fTitle = feat.title?.[checkLang] || "";
      if (!fTitle.trim()) {
        errs[`feature_${idx}_${checkLang}`] = `Enter a title for feature ${idx + 1}.`;
      } else if (fTitle.length > 40) {
        errs[`feature_${idx}_${checkLang}`] = "This is too long. Shorten it to 40 characters or fewer.";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Discard handler
  const handleDiscard = () => {
    if (!isDirty) {
      toast("There are no changes to discard.");
      return;
    }
    if (!isArmed) {
      setIsArmed(true);
      armTimerRef.current = setTimeout(disarm, 3500);
      return;
    }
    setCur(normalizeState(saved));
    disarm();
    setErrors({});
    setImgMsg({ text: "", kind: "" });
    toast("Changes discarded.");
  };

  // Save handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    if (!validateForm()) {
      toast.error("Fix the highlighted fields, then save again.");
      return;
    }

    if (!isDirty) {
      toast("Nothing to save yet. Make a change first.");
      return;
    }

    // Format payload for backend compatibility
    const payload = {
      small_heading: cur.small_heading,
      main_heading: cur.main_heading,
      title: cur.main_heading, // synchronized for backend title verification
      description: cur.description,
      image: cur.image?.path || cur.image?.src || "",
      image_data: cur.image,
      cta: {
        description: cur.cta?.description,
        text: cur.cta?.text || { en: "Explore Manufacturing Capabilities", ar: "استكشف قدرات التصنيع" },
        url: cur.cta?.url || "/companies",
      },
      features: cur.features.map((f, idx) => ({
        id: f.id || idx + 1,
        title: f.title,
        icon: f.icon || "factory",
      })),
    };

    try {
      if (onSave) {
        await onSave(payload);
      }
      setSaved(normalizeState(cur));
      toast.success("Changes saved. The section is updated.");
    } catch (err) {
      toast.error(err?.message || "Failed to save section");
    }
  };

  const smallLen = (cur.small_heading?.[lang] || "").length;
  const mainLen = (cur.main_heading?.[lang] || "").length;
  const descLen = (cur.description?.[lang] || "").length;
  const ctaLen = (cur.cta?.description?.[lang] || "").length;

  return (
    <div className="tt19-scope">
      {/* Panel header with editable field count & language toggle */}
      <div className="tt19-card tt19-panel-head">
        <div>
          <h2>06 — Saudi Manufacturing &amp; Localisation</h2>
          <span>13 editable fields</span>
        </div>
        <div className="tt19-lang-toggle" role="tablist" aria-label="Language Switcher">
          <button
            type="button"
            className={`tt19-lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => { setLang("en"); setErrors({}); }}
            role="tab"
            aria-selected={lang === "en"}
          >
            English
          </button>
          <button
            type="button"
            className={`tt19-lang-btn ${lang === "ar" ? "active" : ""}`}
            onClick={() => { setLang("ar"); setErrors({}); }}
            role="tab"
            aria-selected={lang === "ar"}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Main content block */}
      <section className="tt19-card tt19-block mt-4" aria-labelledby="tt19-h-main">
        <div className="tt19-block-head">
          <h3 id="tt19-h-main">Main content</h3>
          <p>The headings, description and picture shown on the left and right of the section.</p>
        </div>

        <div className="tt19-main-grid">
          <div>
            {/* Small heading */}
            <div className="tt19-field">
              <label htmlFor="tt19-f-small">
                Small heading <span className="tt19-req">*</span>
              </label>
              <input
                id="tt19-f-small"
                className={`tt19-control ${errors[`small_heading_${lang}`] ? "invalid" : ""}`}
                type="text"
                maxLength={60}
                dir={lang === "ar" ? "rtl" : "ltr"}
                autoComplete="off"
                value={cur.small_heading?.[lang] || ""}
                onChange={(e) => handleTextChange("small_heading", null, e.target.value)}
              />
              <div className="tt19-foot">
                <span className="err">{errors[`small_heading_${lang}`] || ""}</span>
                <span className={`count ${smallLen > 40 ? "over" : ""}`}>{smallLen} / 40</span>
              </div>
            </div>

            {/* Main heading */}
            <div className="tt19-field">
              <label htmlFor="tt19-f-main">
                Main heading <span className="tt19-req">*</span>
              </label>
              <input
                id="tt19-f-main"
                className={`tt19-control ${errors[`main_heading_${lang}`] ? "invalid" : ""}`}
                type="text"
                maxLength={120}
                dir={lang === "ar" ? "rtl" : "ltr"}
                autoComplete="off"
                value={cur.main_heading?.[lang] || ""}
                onChange={(e) => handleTextChange("main_heading", null, e.target.value)}
              />
              <div className="tt19-foot">
                <span className="err">{errors[`main_heading_${lang}`] || ""}</span>
                <span className={`count ${mainLen > 80 ? "over" : ""}`}>{mainLen} / 80</span>
              </div>
            </div>

            {/* Description */}
            <div className="tt19-field">
              <label htmlFor="tt19-f-desc">
                Description <span className="tt19-req">*</span>
              </label>
              <textarea
                id="tt19-f-desc"
                className={`tt19-control ${errors[`description_${lang}`] ? "invalid" : ""}`}
                rows={6}
                maxLength={500}
                dir={lang === "ar" ? "rtl" : "ltr"}
                value={cur.description?.[lang] || ""}
                onChange={(e) => handleTextChange("description", null, e.target.value)}
              />
              <div className="tt19-foot">
                <span className="err">{errors[`description_${lang}`] || ""}</span>
                <span className={`count ${descLen > 380 ? "over" : ""}`}>{descLen} / 380</span>
              </div>
            </div>
          </div>

          {/* Main image uploader */}
          <div className="tt19-field">
            <span className="label" id="tt19-img-label">Main image</span>
            <div
              className={`tt19-uploader ${isDragging ? "dragging" : ""}`}
              aria-labelledby="tt19-img-label"
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer?.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
              }}
            >
              <div
                className={`tt19-stage ${cur.image ? "has-img" : ""}`}
                onClick={() => { if (!cur.image) fileInputRef.current?.click(); }}
              >
                {cur.image ? (
                  <img src={cur.image.src} alt="Preview of the main image" />
                ) : (
                  <div className="tt19-empty">
                    <svg className="i big" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="1.8" />
                      <path d="M21 16l-5-5-8 8" />
                    </svg>
                    <span>
                      <strong>Drag an image here</strong>
                      <br />
                      or choose a file from your device
                    </span>
                  </div>
                )}
              </div>

              <div className="tt19-file-line">
                <div className="tt19-file-info">
                  <div className="name">{cur.image ? cur.image.name : "No image selected"}</div>
                  <div className="meta">
                    {cur.image ? cur.image.meta : "Add an image to show in this section."}
                  </div>
                </div>

                <button
                  type="button"
                  className="tt19-btn sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 16V4M7 9l5-5 5 5" />
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                  </svg>
                  <span>{cur.image ? "Replace image" : "Choose image"}</span>
                </button>

                {cur.image && (
                  <button
                    type="button"
                    className="tt19-btn sm danger-ghost"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                )}
              </div>

              {imgMsg.text && (
                <p className={`tt19-img-msg ${imgMsg.kind}`} role="status">
                  {imgMsg.text}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageFile(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />

              <p className="tt19-foot">
                <span className="hint">JPG, PNG or WebP, up to 5 MB. Best at 1200 × 900 px (4:3).</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA box card */}
      <section className="tt19-card tt19-block mt-4" aria-labelledby="tt19-h-cta">
        <div className="tt19-block-head">
          <h3 id="tt19-h-cta">CTA box</h3>
          <p>The short message inside the call-to-action box. The button itself is managed by the design.</p>
        </div>
        <div className="tt19-field">
          <label htmlFor="tt19-f-cta">
            CTA description <span className="tt19-req">*</span>
          </label>
          <textarea
            id="tt19-f-cta"
            className={`tt19-control ${errors[`cta_description_${lang}`] ? "invalid" : ""}`}
            rows={4}
            maxLength={260}
            dir={lang === "ar" ? "rtl" : "ltr"}
            value={cur.cta?.description?.[lang] || ""}
            onChange={(e) => handleTextChange("cta", "description", e.target.value)}
          />
          <div className="tt19-foot">
            <span className="err">{errors[`cta_description_${lang}`] || ""}</span>
            <span className={`count ${ctaLen > 200 ? "over" : ""}`}>{ctaLen} / 200</span>
          </div>
        </div>
      </section>

      {/* Features card */}
      <section className="tt19-card tt19-block mt-4" aria-labelledby="tt19-h-feat">
        <div
          className="tt19-block-head"
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 id="tt19-h-feat">Features</h3>
            <p>Edit the title and choose an icon for each feature.</p>
          </div>
          <span className="tt19-lock">
            <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            4 fixed features
          </span>
        </div>

        <div className="tt19-features">
          {cur.features.map((feat, idx) => {
            const fTitleLen = (feat.title?.[lang] || "").length;
            const currentIconKey = feat.icon || "factory";
            const currentIconData = TT19_ICONS[currentIconKey] || TT19_ICONS.factory;
            const isGridOpen = openGridIndex === idx;

            return (
              <article className="tt19-feature" key={feat.id || idx}>
                <header>
                  <h4>Feature {idx + 1}</h4>
                  <span className="tt19-lock">Fixed</span>
                </header>

                <div className="tt19-field">
                  <label htmlFor={`tt19-ft-${idx}`}>
                    Feature title <span className="tt19-req">*</span>
                  </label>
                  <input
                    id={`tt19-ft-${idx}`}
                    className={`tt19-control ${errors[`feature_${idx}_${lang}`] ? "invalid" : ""}`}
                    type="text"
                    maxLength={60}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    autoComplete="off"
                    value={feat.title?.[lang] || ""}
                    onChange={(e) => handleFeatureTitleChange(idx, e.target.value)}
                  />
                  <div className="tt19-foot">
                    <span className="err">{errors[`feature_${idx}_${lang}`] || ""}</span>
                    <span className={`count ${fTitleLen > 40 ? "over" : ""}`}>{fTitleLen} / 40</span>
                  </div>
                </div>

                <div className="tt19-field">
                  <span className="label">Feature icon</span>
                  <div className="tt19-icon-row">
                    <div className="tt19-badge">
                      <SvgIcon iconKey={currentIconKey} />
                    </div>
                    <div className="tt19-icon-name">
                      <strong>{currentIconData.label}</strong>
                      <span>Selected icon</span>
                    </div>
                    <button
                      type="button"
                      className="tt19-btn sm"
                      aria-expanded={isGridOpen}
                      onClick={() => setOpenGridIndex(isGridOpen ? null : idx)}
                    >
                      {isGridOpen ? "Close" : "Change icon"}
                    </button>
                  </div>

                  {isGridOpen && (
                    <div
                      className="tt19-icon-grid"
                      role="radiogroup"
                      aria-label={`Icon for feature ${idx + 1}`}
                    >
                      {Object.keys(TT19_ICONS).map((iconKey) => {
                        const isSelected = iconKey === currentIconKey;
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            className="tt19-pick"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={TT19_ICONS[iconKey].label}
                            onClick={() => handleFeatureIconChange(idx, iconKey)}
                          >
                            <SvgIcon iconKey={iconKey} />
                            <span>{TT19_ICONS[iconKey].label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="tt19-savebar mt-4">
        <div className={`tt19-status ${isDirty ? "dirty" : ""}`} role="status">
          <span className="tt19-dot"></span>
          <span>{isDirty ? "You have unsaved changes" : "All changes saved"}</span>
        </div>

        <div className="tt19-actions">
          <button
            type="button"
            className={`tt19-btn ${isArmed ? "armed" : ""}`}
            onClick={handleDiscard}
            disabled={isSaving}
          >
            {isArmed ? "Click again to discard" : "Discard changes"}
          </button>

          <button
            type="button"
            className="tt19-btn primary"
            onClick={handleSave}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Saving…</span>
              </>
            ) : (
              <>
                <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
