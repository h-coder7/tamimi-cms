"use client";

import { useEffect, useState } from "react";
import { publicPath } from "@/utils/publicPath";

export default function PostDetailsOffcanvas({ show, post, onClose }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const isEvent = post?.category === "Events & Exhibitions";

    return (
        <>
            <div
                className={`offcanvas offcanvas-end border-0 shadow ${show ? "show" : ""}`}
                tabIndex="-1"
                style={{ visibility: show ? "visible" : "hidden", width: "480px" }}
            >
                <div className="offcanvas-header border-bottom py-3">
                    <h5 className="offcanvas-title fsz-16">
                        <i className="fal fa-newspaper me-2"></i> Post Details
                    </h5>
                    <button type="button" className="btn-close text-reset" onClick={onClose}></button>
                </div>
                <div className="offcanvas-body p-4 custom-scroll">
                    {post ? (
                        <div>
                            {post.cover && (
                                <div className="mb-3 rounded-3 overflow-hidden border" style={{ height: 160 }}>
                                    <img
                                        src={publicPath(post.cover)}
                                        alt=""
                                        className="w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}

                            <h6 className="fsz-18 mb-3">{post.title}</h6>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                <span className="badge bg-light text-dark border fsz-11">{post.category}</span>
                                <span className="badge bg-light text-dark border fsz-11">{post.status}</span>
                            </div>

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">Summary</label>
                                <div className="fsz-13">{post.summary || "N/A"}</div>
                            </div>

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">Body</label>
                                <div
                                    className="fsz-13"
                                    dangerouslySetInnerHTML={{ __html: post.body || "<p>N/A</p>" }}
                                />
                            </div>

                            {isEvent && (
                                <>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">Event</label>
                                        <div className="fsz-13">
                                            {post.event_start || "—"}
                                            {post.event_end ? ` → ${post.event_end}` : ""}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">Venue</label>
                                        <div className="fsz-13">{post.venue || "—"}</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted fsz-11 text-uppercase d-block mb-1">City</label>
                                        <div className="fsz-13">{post.city || "—"}</div>
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">Company</label>
                                <div className="fsz-13">{post.company_code || "None"}</div>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted fsz-11 text-uppercase d-block mb-1">Publish date</label>
                                <div className="fsz-13">{post.publish_date || "—"}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">Loading...</div>
                    )}
                </div>
            </div>
            {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
        </>
    );
}
