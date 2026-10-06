const items = [
    {
        title: "Company profiles (basic info)",
        status: "Ready",
        tone: "ready",
    },
    {
        title: "Industries We Power mapping",
        status: "Draft — awaiting approval",
        tone: "draft",
    },
    {
        title: "Project case studies",
        status: "Pending — being collected",
        tone: "pending",
    },
    {
        title: "Photography & video",
        status: "Pending — being collected",
        tone: "pending",
    },
    {
        title: "HSE & quality certificates",
        status: "Pending — being collected",
        tone: "pending",
    },
    {
        title: "Group History & Home copy",
        status: "Pending — final copy",
        tone: "pending",
    },
    {
        title: "Client & partner logos",
        status: "Not started",
        tone: "idle",
    },
];

const readyCount = items.filter((item) => item.tone === "ready").length;

export default function ContentReadiness() {
    return (
        <div className="card border-0 radius-15 p-4 mt-4 content-readiness">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <h5 className="mb-0 fsz-18">Content readiness</h5>
                    <span className="readiness-summary">
                        {readyCount} of {items.length} ready
                    </span>
                </div>
            </div>

            <div className="card-body p-0 pt-2">
                <ul className="readiness-list">
                    {items.map((item) => (
                        <li key={item.title} className="readiness-item">
                            <div className="readiness-title">{item.title}</div>
                            <span className={`readiness-badge tone-${item.tone}`}>
                                {item.status}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
