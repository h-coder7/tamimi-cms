"use client";

import { useI18n } from "@/hooks/useI18n";

const items = [
    {
        titleKey: "overview.item.profiles",
        statusKey: "overview.status.ready",
        tone: "ready",
    },
    {
        titleKey: "overview.item.mapping",
        statusKey: "overview.status.draftApproval",
        tone: "draft",
    },
    {
        titleKey: "overview.item.cases",
        statusKey: "overview.status.pending",
        tone: "pending",
    },
    {
        titleKey: "overview.item.media",
        statusKey: "overview.status.pending",
        tone: "pending",
    },
    {
        titleKey: "overview.item.hse",
        statusKey: "overview.status.pending",
        tone: "pending",
    },
    {
        titleKey: "overview.item.copy",
        statusKey: "overview.status.finalCopy",
        tone: "pending",
    },
    {
        titleKey: "overview.item.logos",
        statusKey: "overview.status.notStarted",
        tone: "idle",
    },
];

const readyCount = items.filter((item) => item.tone === "ready").length;

export default function ContentReadiness() {
    const { t } = useI18n();
    return (
        <div className="card border-0 radius-15 p-4 mt-4 content-readiness">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <h5 className="mb-0 fsz-18">{t("overview.readiness")}</h5>
                    <span className="readiness-summary">
                        {t("overview.readyCount", { ready: readyCount, total: items.length })}
                    </span>
                </div>
            </div>

            <div className="card-body p-0 pt-2">
                <ul className="readiness-list">
                    {items.map((item) => (
                        <li key={item.titleKey} className="readiness-item">
                            <div className="readiness-title">{t(item.titleKey)}</div>
                            <span className={`readiness-badge tone-${item.tone}`}>
                                {t(item.statusKey)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
