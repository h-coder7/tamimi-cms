const stats = [
    {
        title: "Companies",
        value: "18",
        detail: "9 subsidiaries · 9 JVs",
    },
    {
        title: "Industries",
        value: "9",
        detail: "Draft mapping",
    },
    {
        title: "Projects",
        value: "6",
        detail: "Sample data · 3 featured",
    },
    {
        title: "Open jobs",
        value: "4",
        detail: "Sample data · 6 applications",
    },
    {
        title: "New messages",
        value: "3",
        detail: "Sample data · 6 total",
    },
];

export default function StatisticsSection() {
    return (
        <div className="statics-sec pt-0">
            <div className="statics">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-5 g-3">
                    {stats.map((item) => (
                        <div className="col" key={item.title}>
                            <div className="item">
                                <div className="stat-label">{item.title}</div>
                                <h5 className="stat-value">{item.value}</h5>
                                <div className="stat-detail">{item.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
