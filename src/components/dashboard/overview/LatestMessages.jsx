"use client";

import { useI18n } from "@/hooks/useI18n";

const messages = [
    {
        labelKey: "overview.sample.inquiry",
        detailKey: "overview.sample.switchgear",
        timeKey: "overview.time.2h",
        tone: "inquiry",
    },
    {
        labelKey: "overview.sample.application",
        detailKey: "overview.sample.hse",
        timeKey: "overview.time.5h",
        tone: "application",
    },
    {
        labelKey: "overview.sample.inquiry",
        detailKey: "overview.sample.desal",
        timeKey: "overview.time.yesterday",
        tone: "inquiry",
    },
    {
        labelKey: "overview.sample.contact",
        detailKey: "overview.sample.partner",
        timeKey: "overview.time.yesterday",
        tone: "contact",
    },
];

export default function LatestMessages() {
    const { t } = useI18n();
    return (
        <div className="card border-0 radius-15 p-4 mt-4 latest-messages">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fsz-18">{t("overview.latest")}</h5>
                </div>
            </div>

            <div className="card-body p-0 pt-2">
                <ul className="messages-list">
                    {messages.map((item) => (
                        <li key={`${item.labelKey}-${item.detailKey}`} className="message-item">
                            <div>
                                <div className={`message-label tone-${item.tone}`}>{t(item.labelKey)}</div>
                                <div className="message-detail">{t(item.detailKey)}</div>
                            </div>
                            <div className="message-time">{t(item.timeKey)}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
