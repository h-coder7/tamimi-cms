"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmAction } from "@/utils/confirm";
import { publicPath } from "@/utils/publicPath";

export default function TitleWrapper() {
    const [user, setUser] = useState({ name: "Super Admin", email: "admin@skybridge.com" });
    const quickCreateItems = [
        { label: "Company", icon: "fal fa-building", path: "/dashboard/companies" },
        { label: "Industry", icon: "fal fa-industry", path: "/dashboard/industries" },
        { label: "Project", icon: "fal fa-briefcase", path: "/dashboard/projects" },
        { label: "Logo", icon: "fal fa-handshake", path: "/dashboard/clients-partners" },
        { label: "Certificate", icon: "fal fa-certificate", path: "/dashboard/certificates" },
        { label: "Download", icon: "fal fa-download", path: "/dashboard/downloads" },
        { label: "Post", icon: "fal fa-newspaper", path: "/dashboard/posts" },
        { label: "Job", icon: "fal fa-user-hard-hat", path: "/dashboard/jobs" },
    ];

    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data:", error);
            }
        }
    }, []);

    const handleQuickCreate = (path) => {
        router.push(`${path}?action=add`);
    };

    const handleLogout = () => {
        confirmAction({
            title: "Logout?",
            message: "Are you sure you want to logout?",
            confirmLabel: "Logout",
            onConfirm: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.replace("/login");
            },
        });
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    return (
        <div className="title-wrapper">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
                {/* Left: Search Bar */}
                <div className="search-box">
                    <div className="form-group position-relative">
                        <i className="fal fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fsz-14"></i>
                        <input type="text" className="form-control" placeholder="Search" />
                        <button className="shortcut-hint" type="button"> <i className="fal fa-search"></i> </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="d-flex align-items-center gap-2 actions-wrapper flex-wrap mt-3 mt-lg-0">

                    {/* Add New Button */}
                    <div className="dropdown quick-create">
                        <button className="butn-st2 blue-butn butn-md d-flex align-items-center gap-2 after-none" data-bs-toggle="dropdown">
                            <i className="fal fa-plus-circle"></i>
                            <span>Add New</span>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end p-4 quick-create-grid">
                            <div className="row g-3">
                                {quickCreateItems.map((item, idx) => (
                                    <div className="col-lg-3 col-6" key={idx}>
                                        <div
                                            className="grid-item text-center cursor-pointer"
                                            onClick={() => handleQuickCreate(item.path)}
                                        >
                                            <div className="icon-box mb-1">
                                                <i className={item.icon}></i>
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Utility Icons */}
                    <div className="d-flex align-items-center gap-1 utility-icons ms-lg-2">
                        <button className="icon-btn d-none d-sm-flex"><i className="fal fa-globe"></i></button>
                        <button className="icon-btn d-none d-sm-flex" onClick={toggleFullScreen}>
                            <i className="fal fa-expand"></i>
                        </button>
                        {/* <button className="icon-btn position-relative">
                            <i className="fal fa-envelope"></i>
                            <span className="badge-dot bg-danger">1</span>
                        </button> */}
                        {/* <button className="icon-btn position-relative">
                            <i className="fal fa-bell"></i>
                            <span className="badge-dot bg-danger"></span>
                        </button> */}
                        <Link href="/dashboard/settings" className="icon-btn">
                            <i className="fal fa-cog"></i>
                        </Link>
                    </div>

                    {/* Profile */}
                    <div className="dropdown profile-wrapper ms-2">
                        <div className="avatar dropdown-toggle after-none" data-bs-toggle="dropdown">
                            <div className="icon-40 p-10 rounded-circle bg-grad1 position-relative">
                                <Image src={publicPath("/images/logo.png")} alt="" fill className="img-contain" />
                            </div>
                        </div>
                        <ul className="dropdown-menu dropdown-menu-end mt-2 border-0 shadow-sm overflow-hidden">
                            <li>
                                <div className="p-3 bg-light radius-10 bg-grad1">
                                    <h6 className="mb-0 fsz-12 fw-bold">{user.name}</h6>
                                    <small className="fsz-12">{user.email}</small>
                                </div>
                            </li>
                            <li>
                                <Link href="/dashboard/settings" className="dropdown-item fsz-13 mt-2">
                                    <i className="fal fa-gear me-2"></i> Settings
                                </Link>
                            </li>
                            <li>
                                <button className="dropdown-item text-danger py-2 fsz-13" onClick={handleLogout}>
                                    <i className="fal fa-sign-out me-2"></i> Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
