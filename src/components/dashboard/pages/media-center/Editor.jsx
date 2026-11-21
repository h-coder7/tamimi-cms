"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PageImageUpload from "../_shared/PageImageUpload";
import { useCmsPage, useUpdateCmsPage } from "@/hooks/useCmsPages";
import { useI18n } from "@/hooks/useI18n";
import { defaultContent, pageMeta } from "./data";

const SECTIONS = [
    { id: "hero", number: "01", titleKey: "pages.section.media", fieldsCount: 5 },
    { id: "posts", number: "02", title: "Posts", fieldsCount: 0, badgeKey: "pages.fromModule" },
];

function migrateContent(content = {}) {
    const oldHero = content.hero || content.section_1 || {};
    return {
        hero: {
            ...defaultContent.hero,
            ...oldHero,
            title: oldHero.title ?? defaultContent.hero.title,
            intro_text: oldHero.intro_text ?? oldHero.body ?? defaultContent.hero.intro_text,
            background_image: oldHero.background_image ?? null,
        },
        posts: {},
    };
}

function localizedValue(value, locale) {
    if (typeof value === "string") return value;
    return value?.[locale] || value?.en || "";
}

export default function MediaCenterEditor() {
    const { t, isRtl } = useI18n();
    const router = useRouter();
    const { data: page, isLoading } = useCmsPage(pageMeta.id);
    const updateMutation = useUpdateCmsPage();
    const [activeSectionId, setActiveSectionId] = useState("hero");
    const [draft, setDraft] = useState(null);
    const content = draft || migrateContent(page?.content);
    const section = content[activeSectionId] || {};
    const activeSection = SECTIONS.find((item) => item.id === activeSectionId) || SECTIONS[0];
    const index = SECTIONS.findIndex((item) => item.id === activeSection.id);

    const setField = (key, value) => setDraft((current) => ({
        ...(current || content),
        [activeSectionId]: { ...((current || content)[activeSectionId] || {}), [key]: value },
    }));
    const setLocalizedField = (key, locale, value) => {
        const old = section[key];
        const current = old && typeof old === "object" ? old : { en: old || "", ar: "" };
        setField(key, { ...current, [locale]: value });
    };
    const save = async () => {
        await updateMutation.mutateAsync({ ...page, content, status: "Published" });
        router.push("/dashboard/pages");
    };

    if (isLoading) return <div className="text-center py-5 text-muted">{t("pages.loadingEditor")}</div>;
    if (!page) return <div className="text-center py-5"><p className="text-muted mb-3">{t("pages.notFound")}</p><button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/dashboard/pages")}>{t("pages.back")}</button></div>;

    return <>
        <PageHeader title={t("pages.editTitle", { page: page.page })} icon="fal fa-file-edit" titleCol="col-lg-5" actionCol="col-lg-7">
            <button type="button" className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0" onClick={() => window.open(page.url || pageMeta.url, "_blank", "noopener,noreferrer")}>{t("pages.preview")} <i className="fal fa-external-link ms-2" /></button>
            <button type="button" className="alert alert-light rounded-pill py-2 px-3 fsz-12 ms-2 border mb-0" onClick={() => router.push("/dashboard/pages")}>{t("common.cancel")}</button>
            <button type="button" className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0" onClick={save} disabled={updateMutation.isPending}><i className="fal fa-check" /><span className="txt ms-2">{t("pages.savePublish")}</span></button>
        </PageHeader>
        <div className="page-editor mt-4">
            <aside className="page-editor__sidebar table-content p-0 mt-0 mb-0">
                <div className="page-editor__sidebar-head"><h6 className="mb-0 fsz-13 fw-600">{t("pages.sections")}</h6></div>
                <div className="page-editor__sections">{SECTIONS.map((item) => <button key={item.id} type="button" className={`page-editor__section-item ${item.id === activeSectionId ? "active" : ""}`} onClick={() => setActiveSectionId(item.id)}><span className="page-editor__section-main"><span className="page-editor__section-num">{item.number}</span><span className="page-editor__section-title">{item.titleKey ? t(item.titleKey) : item.title}</span></span><i className="fal fa-angle-right text-muted" /></button>)}</div>
                <div className="page-editor__sidebar-foot">{t("pages.sectionOrder")}</div>
            </aside>
            <section className="page-editor__main table-content mt-0 mb-0">
                <div className="page-editor__main-head"><h6 className="mb-0 fsz-14 fw-600">{activeSection.number} · {activeSection.titleKey ? t(activeSection.titleKey) : activeSection.title}</h6><span className="fsz-12 text-muted">{activeSection.fieldsCount ? t("pages.editableFields", { count: activeSection.fieldsCount }) : t("pages.fromModule")}</span></div>
                <div className="page-editor__fields"><div className="row g-3">
                    {activeSectionId === "hero" && <>
                        {[{ key: "title", label: t("pages.fields.title"), max: 90, multiline: false }, { key: "intro_text", label: t("pages.fields.intro"), max: 240, multiline: true }].map(({ key, label, max, multiline }) => <div className="col-12" key={key}><label className="form-label fsz-12 text-muted">{label} <span className="text-danger">*</span></label><div className="row g-2">{["en", "ar"].map((locale) => { const value = localizedValue(section[key], locale); const id = `media-hero-${key}-${locale}`; return <div className="col-md-6" key={locale}><label className="form-text fsz-11" htmlFor={id}>{locale.toUpperCase()}</label>{multiline ? <textarea id={id} dir={locale === "ar" ? "rtl" : "ltr"} className="form-control" rows={3} maxLength={max} value={value} onChange={(event) => setLocalizedField(key, locale, event.target.value)} /> : <input id={id} dir={locale === "ar" ? "rtl" : "ltr"} className="form-control" maxLength={max} value={value} onChange={(event) => setLocalizedField(key, locale, event.target.value)} />}<div className="form-text fsz-11">{value.length}/{max}</div></div>; })}</div></div>)}
                        <div className="col-12"><label className="form-label fsz-12 text-muted">{isRtl ? "صورة خلفية صفحة المركز الإعلامي" : "Media Center background image"}</label><PageImageUpload slug="media" value={section.background_image || ""} onChange={(value) => setField("background_image", value || null)} maxBytes={5 * 1024 * 1024} title={isRtl ? "ارفع صورة الخلفية" : "Upload background image"} accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }} /></div>
                    </>}
                    {activeSectionId === "posts" && <div className="col-12"><p className="fsz-13 fw-600 mb-2">{t("pages.fromModule")}</p><p className="fsz-12 text-muted mb-0">{isRtl ? "الخبر المميز والقائمة والفلاتر تُدار تلقائيًا من وحدة المقالات." : "The featured post, listing and filters are managed automatically from Posts."}</p><Link href="/dashboard/posts" className="btn btn-outline-primary fsz-12 mt-3">{t("pages.managePosts")}<i className={`fal ${isRtl ? "fa-arrow-left" : "fa-arrow-right"} ms-2`} /></Link></div>}
                </div></div>
                {index < SECTIONS.length - 1 && <div className="page-editor__next"><span /><button type="button" className="btn btn-outline-secondary fsz-12" onClick={() => setActiveSectionId(SECTIONS[index + 1].id)}>{SECTIONS[index + 1].titleKey ? t(SECTIONS[index + 1].titleKey) : SECTIONS[index + 1].title}<i className="fal fa-arrow-right ms-2" /></button></div>}
            </section>
        </div>
    </>;
}
