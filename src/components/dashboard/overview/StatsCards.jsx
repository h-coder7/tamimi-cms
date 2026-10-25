"use client";

import { useI18n } from "@/hooks/useI18n";

const stats = [
    {
        titleKey: "overview.companies",
        value: "18",
        detailKey: "overview.companiesDetail",
    },
    {
        titleKey: "overview.industries",
        value: "9",
        detailKey: "overview.industriesDetail",
    },
    {
        titleKey: "overview.projects",
        value: "6",
        detailKey: "overview.projectsDetail",
    },
    {
        titleKey: "overview.openJobs",
        value: "4",
        detailKey: "overview.openJobsDetail",
    },
    {
        titleKey: "overview.newMessages",
        value: "3",
        detailKey: "overview.newMessagesDetail",
    },
];

export default function StatisticsSection() {
    const { t } = useI18n();
    return (
        <div className="statics-sec pt-0">
            <div className="statics">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-5 g-3">
                    {stats.map((item) => (
                        <div className="col" key={item.titleKey}>
                            <div className="item">
                                <div className="stat-label">{t(item.titleKey)}</div>
                                <h5 className="stat-value">{item.value}</h5>
                                <div className="stat-detail">{t(item.detailKey)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
