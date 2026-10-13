const messages = [
    {
        label: "[Sample] Inquiry → Tamimi Energy Group",
        detail: "MV switchgear supply for a substation project",
        time: "2h ago",
        tone: "inquiry",
    },
    {
        label: "[Sample] Application",
        detail: "HSE Officer · Dammam",
        time: "5h ago",
        tone: "application",
    },
    {
        label: "[Sample] Inquiry → Tamimi Energy Group",
        detail: "Mobile desalination unit rental",
        time: "Yesterday",
        tone: "inquiry",
    },
    {
        label: "[Sample] Contact",
        detail: "Partnership request",
        time: "Yesterday",
        tone: "contact",
    },
];

export default function LatestMessages() {
    return (
        <div className="card border-0 radius-15 p-4 mt-4 latest-messages">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fsz-18">Latest messages & applications</h5>
                </div>
            </div>

            <div className="card-body p-0 pt-2">
                <ul className="messages-list">
                    {messages.map((item) => (
                        <li key={`${item.label}-${item.detail}`} className="message-item">
                            <div>
                                <div className={`message-label tone-${item.tone}`}>{item.label}</div>
                                <div className="message-detail">{item.detail}</div>
                            </div>
                            <div className="message-time">{item.time}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
