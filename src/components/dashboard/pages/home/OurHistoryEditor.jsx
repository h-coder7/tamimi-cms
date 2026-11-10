"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { uploadPageMedia } from "@/hooks/useCmsPages";
import { publicPath } from "@/utils/publicPath";
import "./our-history.css";

function normalizeHistoryData(raw = {}) {
  const defaultHeading = {
    small_label: { en: "Our history", ar: "تاريخنا" },
    main_title: {
      en: "50+ years of continuous evolution",
      ar: "أكثر من 50 عامًا من التطور المستمر",
    },
  };

  const defaultEras = [
    {
      id: "era-1",
      from_year: 1940,
      to_year: 1971,
      name: { en: "Foundation", ar: "التأسيس" },
      description: {
        en: "Founded by the late Sheikh Ali bin Abdullah Al Tamimi to execute pipelines and general contracting, with SESCO added as the first specialised company.",
        ar: "تأسست على يد المغفور له بإذن الله الشيخ علي بن عبد الله التميمي لتنفيذ خطوط الأنابيب والمقاولات العامة، مع انضمام سيسكو كأول شركة متخصصة.",
      },
      images: [],
    },
    {
      id: "era-2",
      from_year: 1984,
      to_year: 2003,
      name: { en: "Specialisation", ar: "التخصص" },
      description: {
        en: "Clariant Al-Tamimi, S3C, TCO and ENERCO formed over two decades, each holding a distinct technical remit inside the growing group.",
        ar: "تأسست كلاريانت التميمي، وS3C، وTCO، وإنيركو على مدى عقدين، لتمتلك كل منها اختصاصًا فنيًا بارزًا ضمن المجموعة المتنامية.",
      },
      images: [],
    },
    {
      id: "era-3",
      from_year: 2006,
      to_year: 2016,
      name: { en: "Group formation", ar: "تشكيل المجموعة" },
      description: {
        en: "Automation, sensing and water capability added, then Tamimi Energy Holding established in 2016 to hold and manage the subsidiaries as one group.",
        ar: "إضافة قدرات الأتمتة والاستشعار والمياه، ثم تأسيس التميمي للطاقة القابضة في عام 2016 لإدارة الشركات التابعة كمجموعة موحدة.",
      },
      images: [],
    },
    {
      id: "era-4",
      from_year: 2018,
      to_year: 2026,
      name: { en: "Partnership & expansion", ar: "الشراكة والتوسع" },
      description: {
        en: "Scaffolding, measurement and construction companies added, followed by international joint ventures bringing licensed technology into Saudi execution.",
        ar: "إضافة شركات السقالات والقياس والإنشاءات، تلتها مشاريع مشتركة دولية لجلب التقنيات المرخصة للتنفيذ داخل المملكة.",
      },
      images: [],
    },
  ];

  const defaultTimeline = [
    {
      id: "year-1940",
      year: 1940,
      label: { en: "The beginning", ar: "البداية" },
      description: {
        en: "The late Sheikh Ali bin Abdullah Al Tamimi enters business by founding a company to execute pipelines and related general contracting work.",
        ar: "دخل المغفور له بإذن الله الشيخ علي بن عبد الله التميمي عالم الأعمال بتأسيس شركة لتنفيذ خطوط الأنابيب وأعمال المقاولات العامة المرتبطة بها.",
      },
    },
    {
      id: "year-1953",
      year: 1953,
      label: { en: "Expansion", ar: "التوسع" },
      description: {
        en: "First major infrastructure contracts secured in the Eastern Province, establishing lasting energy industry relationships.",
        ar: "الفوز بأول عقود بنية تحتية كبرى في المنطقة الشرقية، وتأسيس علاقات راسخة في قطاع الطاقة.",
      },
    },
    {
      id: "year-1971",
      year: 1971,
      label: { en: "First joint venture", ar: "أول مشروع مشترك" },
      description: {
        en: "SESCO formed as the first specialised contracting joint venture, expanding technical capabilities in oil and gas services.",
        ar: "تأسيس سيسكو كأول مشروع مشترك متخصص للمقاولات، مما وسع القدرات الفنية في خدمات النفط والغاز.",
      },
    },
    {
      id: "year-1984",
      year: 1984,
      label: { en: "Industrial services", ar: "الخدمات الصناعية" },
      description: {
        en: "Specialised industrial chemical and service partnerships launched to support growing national petrochemical infrastructure.",
        ar: "إطلاق شراكات متخصصة في الكيماويات والخدمات الصناعية لدعم البنية التحتية الوطنية المتنامية للبتروكيماويات.",
      },
    },
    {
      id: "year-2003",
      year: 2003,
      label: { en: "New sectors", ar: "قطاعات جديدة" },
      description: {
        en: "Diversification into power generation, instrumentation, calibration and automation services across Saudi Arabia.",
        ar: "التنويع نحو توليد الطاقة والأجهزة والمعايرة وخدمات الأتمتة في جميع أنحاء المملكة.",
      },
    },
    {
      id: "year-2016",
      year: 2016,
      label: { en: "Holding structure", ar: "الهيكل القابض" },
      description: {
        en: "Tamimi Energy Holding formally created to unify governance, strategic investment, and group-level commercial operations.",
        ar: "التأسيس الرسمي لشركة التميمي للطاقة القابضة لتوحيد الحوكمة والاستثمار الاستراتيجي والعمليات التجارية للمجموعة.",
      },
    },
  ];

  const rawHeading = raw.heading || {};
  const heading = {
    small_label: {
      en:
        typeof rawHeading.small_label === "object"
          ? rawHeading.small_label?.en ?? "Our history"
          : rawHeading.small_label ?? "Our history",
      ar:
        typeof rawHeading.small_label === "object"
          ? rawHeading.small_label?.ar ?? "تاريخنا"
          : "تاريخنا",
    },
    main_title: {
      en:
        typeof rawHeading.main_title === "object"
          ? rawHeading.main_title?.en ?? "50+ years of continuous evolution"
          : rawHeading.main_title ?? "50+ years of continuous evolution",
      ar:
        typeof rawHeading.main_title === "object"
          ? rawHeading.main_title?.ar ?? "أكثر من 50 عامًا من التطور المستمر"
          : "أكثر من 50 عامًا من التطور المستمر",
    },
  };

  const rawEras = Array.isArray(raw.eras) && raw.eras.length > 0 ? raw.eras : defaultEras;
  const eras = rawEras.map((e, idx) => ({
    id: e.id || `era-${idx + 1}-${Date.now()}`,
    from_year: e.from_year !== undefined && e.from_year !== null ? Number(e.from_year) : 1940,
    to_year: e.to_year !== undefined && e.to_year !== null ? Number(e.to_year) : 1971,
    name: {
      en: typeof e.name === "object" ? e.name?.en ?? "" : e.name ?? "",
      ar: typeof e.name === "object" ? e.name?.ar ?? "" : "",
    },
    description: {
      en: typeof e.description === "object" ? e.description?.en ?? "" : e.description ?? "",
      ar: typeof e.description === "object" ? e.description?.ar ?? "" : "",
    },
    images: Array.isArray(e.images) ? [...e.images] : [],
  }));

  const rawTimeline =
    Array.isArray(raw.timeline_years) && raw.timeline_years.length > 0
      ? raw.timeline_years
      : defaultTimeline;

  const timeline_years = rawTimeline.map((t, idx) => ({
    id: t.id || `year-${t.year || idx + 1}-${Date.now()}`,
    year: t.year !== undefined && t.year !== null ? Number(t.year) : 1940,
    label: {
      en: typeof t.label === "object" ? t.label?.en ?? "" : t.label ?? "",
      ar: typeof t.label === "object" ? t.label?.ar ?? "" : "",
    },
    description: {
      en: typeof t.description === "object" ? t.description?.en ?? "" : t.description ?? "",
      ar: typeof t.description === "object" ? t.description?.ar ?? "" : "",
    },
  }));

  // Auto-sort timeline_years ascending
  timeline_years.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));

  return { heading, eras, timeline_years };
}

export default function OurHistoryEditor({
  value = {},
  onChange,
  onSave,
  isSaving = false,
}) {
  const [data, setData] = useState(() => normalizeHistoryData(value));
  const [activeTab, setActiveTab] = useState("heading"); // "heading" | "eras" | "timeline"
  const [lang, setLang] = useState("en"); // "en" | "ar"
  const [selectedYearId, setSelectedYearId] = useState(() => data.timeline_years[0]?.id || "");
  const [showPreview, setShowPreview] = useState(false);
  const [publicActiveYear, setPublicActiveYear] = useState(() => data.timeline_years[0]?.year || 1940);
  const [uploadingEraIdx, setUploadingEraIdx] = useState(null);
  const fileInputRef = useRef(null);
  const activeEraForUploadRef = useRef(null);
  const lastEmittedRef = useRef(null);
  const yearInputRef = useRef(null);

  // Sync incoming external value
  useEffect(() => {
    if (!value || Object.keys(value).length === 0) return;
    if (lastEmittedRef.current === value) {
      return;
    }
    setData(normalizeHistoryData(value));
  }, [value]);

  // Keep selectedYearId valid
  useEffect(() => {
    if (!data.timeline_years.some((y) => y.id === selectedYearId) && data.timeline_years.length > 0) {
      setSelectedYearId(data.timeline_years[0].id);
    }
  }, [data.timeline_years, selectedYearId]);

  // Ensure publicActiveYear is always valid and matches earliest by default
  useEffect(() => {
    if (!data.timeline_years.some((y) => Number(y.year) === Number(publicActiveYear)) && data.timeline_years.length > 0) {
      setPublicActiveYear(data.timeline_years[0].year);
    }
  }, [data.timeline_years, publicActiveYear]);

  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      lastEmittedRef.current = next;
      if (onChange) {
        onChange(next);
      }
      return next;
    });
  };

  // --- Heading Tab Handlers ---
  const handleHeadingChange = (field, text) => {
    updateData((prev) => ({
      ...prev,
      heading: {
        ...prev.heading,
        [field]: {
          ...prev.heading[field],
          [lang]: text,
        },
      },
    }));
  };

  // --- Eras Tab Handlers ---
  const handleEraFieldChange = (index, field, val) => {
    updateData((prev) => {
      const newEras = [...prev.eras];
      const target = { ...newEras[index] };
      if (field === "from_year" || field === "to_year") {
        target[field] = val === "" ? "" : Number(val);
      } else {
        target[field] = {
          ...target[field],
          [lang]: val,
        };
      }
      newEras[index] = target;
      return { ...prev, eras: newEras };
    });
  };

  const handleMoveEra = (index, direction) => {
    updateData((prev) => {
      const newEras = [...prev.eras];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newEras.length) return prev;
      const temp = newEras[index];
      newEras[index] = newEras[targetIndex];
      newEras[targetIndex] = temp;
      return { ...prev, eras: newEras };
    });
  };

  const handleDeleteEra = (index) => {
    const eraName = data.eras[index]?.name?.[lang] || `Era ${index + 1}`;
    if (!window.confirm(`Are you sure you want to delete "${eraName}"?`)) {
      return;
    }
    updateData((prev) => {
      if (prev.eras.length <= 1) {
        toast.error("At least one era is required");
        return prev;
      }
      const newEras = prev.eras.filter((_, i) => i !== index);
      return { ...prev, eras: newEras };
    });
  };

  const handleAddEra = () => {
    updateData((prev) => {
      const lastEra = prev.eras[prev.eras.length - 1];
      const nextFrom = lastEra ? Number(lastEra.to_year || 2026) : 2026;
      const newEra = {
        id: `era-${Date.now()}`,
        from_year: nextFrom,
        to_year: nextFrom + 5,
        name: { en: "New Era", ar: "عصر جديد" },
        description: { en: "", ar: "" },
        images: [],
      };
      return { ...prev, eras: [...prev.eras, newEra] };
    });
  };

  const handleTriggerUpload = (eraIndex) => {
    activeEraForUploadRef.current = eraIndex;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const eraIndex = activeEraForUploadRef.current;
    if (!file || eraIndex === null || eraIndex === undefined) return;

    setUploadingEraIdx(eraIndex);
    try {
      const res = await uploadPageMedia("home", file, "image");
      const uploadedPath = res?.path || res?.url || (typeof res === "string" ? res : "");
      updateData((prev) => {
        const newEras = [...prev.eras];
        const target = { ...newEras[eraIndex] };
        target.images = [...(target.images || []), uploadedPath];
        newEras[eraIndex] = target;
        return { ...prev, eras: newEras };
      });
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploadingEraIdx(null);
      activeEraForUploadRef.current = null;
    }
  };

  const handleRemoveEraImage = (eraIndex, imgIndex) => {
    updateData((prev) => {
      const newEras = [...prev.eras];
      const target = { ...newEras[eraIndex] };
      target.images = target.images.filter((_, i) => i !== imgIndex);
      newEras[eraIndex] = target;
      return { ...prev, eras: newEras };
    });
  };

  // --- Timeline Years Handlers ---
  const handleTimelineFieldChange = (id, field, val) => {
    updateData((prev) => {
      let duplicate = false;
      if (field === "year" && val !== "") {
        const numVal = Number(val);
        duplicate = prev.timeline_years.some((y) => y.id !== id && Number(y.year) === numVal);
      }

      if (duplicate) {
        toast.error("Duplicate timeline years are not allowed");
      }

      const nextList = prev.timeline_years.map((item) => {
        if (item.id !== id) return item;
        if (field === "year") {
          return { ...item, year: val === "" ? "" : Number(val) };
        }
        return {
          ...item,
          [field]: {
            ...item[field],
            [lang]: val,
          },
        };
      });

      // Maintain ascending chronological sort
      nextList.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));

      return { ...prev, timeline_years: nextList };
    });
  };

  const handleAddTimelineYear = () => {
    updateData((prev) => {
      const existingYears = prev.timeline_years
        .map((y) => Number(y.year))
        .filter((y) => !isNaN(y));
      const maxYear = existingYears.length > 0 ? Math.max(...existingYears) : 2026;
      let newYear = maxYear + 1;
      while (existingYears.includes(newYear)) {
        newYear++;
      }

      const newItem = {
        id: `year-${Date.now()}`,
        year: newYear,
        label: { en: "New Milestone", ar: "محطة جديدة" },
        description: { en: "", ar: "" },
      };

      const nextList = [...prev.timeline_years, newItem];
      nextList.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
      setSelectedYearId(newItem.id);
      return { ...prev, timeline_years: nextList };
    });
    setTimeout(() => {
      if (yearInputRef.current) {
        yearInputRef.current.focus();
        yearInputRef.current.select?.();
      }
    }, 50);
  };

  const handleDuplicateYear = (id) => {
    updateData((prev) => {
      const source = prev.timeline_years.find((y) => y.id === id);
      if (!source) return prev;

      const existingYears = prev.timeline_years.map((y) => Number(y.year)).filter((y) => !isNaN(y));
      let nextYear = (Number(source.year) || 2026) + 1;
      while (existingYears.includes(nextYear)) {
        nextYear++;
      }

      const duplicate = {
        id: `year-${Date.now()}`,
        year: nextYear,
        label: { ...source.label },
        description: { ...source.description },
      };

      const nextList = [...prev.timeline_years, duplicate];
      nextList.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
      setSelectedYearId(duplicate.id);
      toast.success(`Duplicated into year ${nextYear}`);
      return { ...prev, timeline_years: nextList };
    });
  };

  const handleDeleteTimelineYear = (id) => {
    if (data.timeline_years.length <= 1) {
      toast.error("At least one timeline year is required");
      return;
    }
    const target = data.timeline_years.find((y) => y.id === id);
    const yrLabel = target?.year || "this year";
    if (!window.confirm(`Are you sure you want to delete year ${yrLabel} from the timeline?`)) {
      return;
    }

    updateData((prev) => {
      const nextList = prev.timeline_years.filter((y) => y.id !== id);
      if (selectedYearId === id && nextList.length > 0) {
        setSelectedYearId(nextList[0].id);
      }
      return { ...prev, timeline_years: nextList };
    });
  };

  const selectedTimelineYear =
    data.timeline_years.find((y) => y.id === selectedYearId) ||
    data.timeline_years[0] ||
    null;

  // Selected year for public preview display
  const activePublicTimelineEntry =
    data.timeline_years.find((y) => Number(y.year) === Number(publicActiveYear)) ||
    data.timeline_years[0];

  return (
    <div className="our-history-editor">
      {/* Hidden File Input for Picture Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Tabs Bar & Controls */}
      <div className="oh-tabs-container">
        <div className="oh-tabs">
          <button
            type="button"
            className={`oh-tab ${activeTab === "heading" ? "active" : ""}`}
            onClick={() => setActiveTab("heading")}
          >
            Heading
          </button>
          <button
            type="button"
            className={`oh-tab ${activeTab === "eras" ? "active" : ""}`}
            onClick={() => setActiveTab("eras")}
          >
            Eras · {data.eras.length}
          </button>
          <button
            type="button"
            className={`oh-tab ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline years · {data.timeline_years.length}
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* EN / AR Switcher */}
          <div className="oh-lang-switch">
            <button
              type="button"
              className={`oh-lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`oh-lang-btn ${lang === "ar" ? "active" : ""}`}
              onClick={() => setLang("ar")}
            >
              AR
            </button>
          </div>

          {/* Public Preview Toggle */}
          <button
            type="button"
            className={`oh-preview-toggle-btn ${showPreview ? "active" : ""}`}
            onClick={() => setShowPreview((p) => !p)}
            title="Toggle Live Public Preview"
          >
            <i className={`fal ${showPreview ? "fa-eye-slash" : "fa-eye"}`}></i>
            <span>{showPreview ? "Hide Preview" : "Preview Presentation"}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HEADING */}
      {activeTab === "heading" && (
        <div className="row g-3">
          <div className="col-12">
            <label className="oh-label">Small label above the title</label>
            <input
              type="text"
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="oh-input"
              value={data.heading?.small_label?.[lang] || ""}
              onChange={(e) => handleHeadingChange("small_label", e.target.value)}
              placeholder="Our history"
            />
          </div>

          <div className="col-12">
            <label className="oh-label">Main title</label>
            <input
              type="text"
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="oh-input"
              value={data.heading?.main_title?.[lang] || ""}
              onChange={(e) => handleHeadingChange("main_title", e.target.value)}
              placeholder="50+ years of continuous evolution"
              maxLength={120}
            />
            <p className="oh-hint mb-0">
              Keep it under 60 characters so it fits on two lines. ({String(data.heading?.main_title?.[lang] || "").length}/60)
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: ERAS */}
      {activeTab === "eras" && (
        <div className="oh-eras-list">
          {data.eras.map((era, idx) => (
            <div key={era.id || idx} className="oh-era-card">
              <div className="oh-era-head">
                <h6 className="oh-era-title">Era {idx + 1}</h6>
                <div className="oh-era-actions">
                  <button
                    type="button"
                    className="oh-icon-btn"
                    title="Move up"
                    disabled={idx === 0}
                    onClick={() => handleMoveEra(idx, "up")}
                  >
                    <i className="fal fa-arrow-up"></i>
                  </button>
                  <button
                    type="button"
                    className="oh-icon-btn"
                    title="Move down"
                    disabled={idx === data.eras.length - 1}
                    onClick={() => handleMoveEra(idx, "down")}
                  >
                    <i className="fal fa-arrow-down"></i>
                  </button>
                  <button
                    type="button"
                    className="oh-icon-btn delete"
                    title="Delete era"
                    onClick={() => handleDeleteEra(idx)}
                  >
                    <i className="fal fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="oh-label">From year</label>
                  <input
                    type="number"
                    className="oh-input"
                    value={era.from_year ?? ""}
                    onChange={(e) => handleEraFieldChange(idx, "from_year", e.target.value)}
                    placeholder="1940"
                  />
                </div>
                <div className="col-md-6">
                  <label className="oh-label">To year</label>
                  <input
                    type="number"
                    className={`oh-input ${era.from_year && era.to_year && Number(era.from_year) > Number(era.to_year) ? "is-invalid" : ""}`}
                    value={era.to_year ?? ""}
                    onChange={(e) => handleEraFieldChange(idx, "to_year", e.target.value)}
                    placeholder="1971"
                  />
                  {era.from_year && era.to_year && Number(era.from_year) > Number(era.to_year) && (
                    <span className="text-danger small mt-1 d-block">
                      From year cannot be greater than To year
                    </span>
                  )}
                </div>

                <div className="col-12">
                  <label className="oh-label">Era name</label>
                  <input
                    type="text"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="oh-input"
                    value={era.name?.[lang] || ""}
                    onChange={(e) => handleEraFieldChange(idx, "name", e.target.value)}
                    placeholder="e.g. Foundation"
                  />
                </div>

                <div className="col-12">
                  <label className="oh-label">Short description</label>
                  <textarea
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    rows={3}
                    className="oh-textarea"
                    value={era.description?.[lang] || ""}
                    onChange={(e) => handleEraFieldChange(idx, "description", e.target.value)}
                    placeholder="Short description of this era..."
                  />
                </div>

                <div className="col-12">
                  <label className="oh-label">Pictures / logos (optional)</label>
                  <div className="oh-pictures-row">
                    {(era.images || []).map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="oh-picture-card">
                        <img src={publicPath(imgUrl)} alt="Era logo" />
                        <button
                          type="button"
                          className="oh-picture-remove"
                          title="Remove picture"
                          onClick={() => handleRemoveEraImage(idx, imgIdx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="oh-add-picture-btn"
                      disabled={uploadingEraIdx === idx}
                      onClick={() => handleTriggerUpload(idx)}
                    >
                      {uploadingEraIdx === idx ? (
                        <>
                          <i className="fal fa-spinner-third fa-spin"></i>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <i className="fal fa-plus"></i>
                          <span>+ Add picture</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="oh-add-era-btn" onClick={handleAddEra}>
            <i className="fal fa-plus"></i>
            <span>+ Add era</span>
          </button>
        </div>
      )}

      {/* TAB 3: TIMELINE YEARS */}
      {activeTab === "timeline" && (
        <div>
          {/* Year Chips Row */}
          <div className="oh-timeline-chips">
            {data.timeline_years.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`oh-year-chip ${item.id === selectedYearId ? "active" : ""}`}
                onClick={() => setSelectedYearId(item.id)}
              >
                {item.year || "New"}
              </button>
            ))}

            <button
              type="button"
              className="oh-add-year-chip-btn"
              onClick={handleAddTimelineYear}
            >
              <i className="fal fa-plus"></i>
              <span>+ Add year</span>
            </button>
          </div>

          {/* Selected Year Form */}
          {selectedTimelineYear && (
            <div className="oh-timeline-form-card">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="oh-label">Year</label>
                  <input
                    ref={yearInputRef}
                    type="number"
                    className="oh-input"
                    value={selectedTimelineYear.year ?? ""}
                    onChange={(e) =>
                      handleTimelineFieldChange(selectedTimelineYear.id, "year", e.target.value)
                    }
                    placeholder="e.g. 1993"
                  />
                </div>

                <div className="col-md-6">
                  <label className="oh-label">Short label under the year</label>
                  <input
                    type="text"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="oh-input"
                    value={selectedTimelineYear.label?.[lang] || ""}
                    onChange={(e) =>
                      handleTimelineFieldChange(selectedTimelineYear.id, "label", e.target.value)
                    }
                    placeholder="e.g. The beginning"
                  />
                </div>

                <div className="col-12">
                  <label className="oh-label">What happened</label>
                  <textarea
                    rows={4}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="oh-textarea"
                    value={selectedTimelineYear.description?.[lang] || ""}
                    onChange={(e) =>
                      handleTimelineFieldChange(selectedTimelineYear.id, "description", e.target.value)
                    }
                    placeholder="What happened"
                  />
                </div>
              </div>

              <div className="oh-timeline-actions-bar">
                <button
                  type="button"
                  className="oh-delete-year-btn"
                  onClick={() => handleDeleteTimelineYear(selectedTimelineYear.id)}
                >
                  Delete this year
                </button>

                <button
                  type="button"
                  className="oh-duplicate-btn"
                  onClick={() => handleDuplicateYear(selectedTimelineYear.id)}
                >
                  Duplicate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE PUBLIC PRESENTATION PREVIEW (Screenshots 4 & 5) */}
      {showPreview && (
        <div className="oh-public-preview mt-4">
          <div className="oh-public-badge">
            {data.heading?.small_label?.[lang] || "OUR HISTORY"}
          </div>
          <h2 className="oh-public-title">
            {data.heading?.main_title?.[lang] || "50+ years of continuous evolution"}
          </h2>

          {/* Eras Grid */}
          <div className="oh-public-eras-grid">
            {data.eras.map((era, idx) => (
              <div key={era.id || idx} className="oh-public-era-item">
                <div className="oh-public-era-years">
                  {era.from_year} – {era.to_year}
                </div>
                <div className="oh-public-era-name">
                  {era.name?.[lang] || "Foundation"}
                </div>
                <div className="oh-public-era-desc">
                  {era.description?.[lang]}
                </div>
                {Array.isArray(era.images) && era.images.length > 0 && (
                  <div className="oh-public-era-logos">
                    {era.images.map((img, i) => (
                      <div key={i} className="oh-public-era-logo-card">
                        <img src={publicPath(img)} alt="Logo" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Rail */}
          <div className="oh-public-rail-container">
            <div className="oh-public-rail">
              {data.timeline_years.map((ty) => {
                const isActive = Number(ty.year) === Number(publicActiveYear);
                return (
                  <button
                    key={ty.id}
                    type="button"
                    className={`oh-public-rail-node ${isActive ? "active" : ""}`}
                    onClick={() => setPublicActiveYear(ty.year)}
                  >
                    <span>{ty.year}</span>
                    <span className="oh-public-rail-dot"></span>
                  </button>
                );
              })}
            </div>

            {/* Selected Year Detail View (Ensuring active year strictly matches displayed content) */}
            {activePublicTimelineEntry && (
              <div className="oh-public-detail">
                <div className="oh-public-detail-year-col">
                  <div className="oh-public-detail-big-year">
                    {activePublicTimelineEntry.year}
                  </div>
                  <div className="oh-public-detail-label">
                    {activePublicTimelineEntry.label?.[lang] || "Milestone"}
                  </div>
                </div>
                <div className="oh-public-detail-text">
                  {activePublicTimelineEntry.description?.[lang] || "No description provided for this year."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
