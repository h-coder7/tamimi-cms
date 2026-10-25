"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { confirmAction } from "@/utils/confirm";
import { publicPath } from "@/utils/publicPath";
import { useAuth } from "@/providers/AuthProvider";
import { getLocale, setLocale } from "@/lib/locale";
import { useI18n } from "@/hooks/useI18n";

export default function TitleWrapper() {
    const { user: authUser, logout } = useAuth();
    const { t } = useI18n();
    const [locale, setLocaleState] = useState("en");
    const user = {
        name: authUser?.name || t("admins.title"),
        email: authUser?.email || "",
    };

    useEffect(() => {
        setLocaleState(getLocale());
        const onChange = (e) => setLocaleState(e.detail || getLocale());
        window.addEventListener("cms-locale-change", onChange);
        return () => window.removeEventListener("cms-locale-change", onChange);
    }, []);

    const handleLocale = (next) => {
        setLocale(next);
        setLocaleState(next);
    };

    const quickCreateItems = [
        { label: t("nav.company"), icon: "fal fa-building", path: "/dashboard/companies" },
        { label: t("nav.industry"), icon: "fal fa-industry", path: "/dashboard/industries" },
        { label: t("nav.project"), icon: "fal fa-briefcase", path: "/dashboard/projects" },
        { label: t("nav.logo"), icon: "fal fa-handshake", path: "/dashboard/clients-partners" },
        { label: t("nav.certificate"), icon: "fal fa-certificate", path: "/dashboard/certificates" },
        { label: t("nav.download"), icon: "fal fa-download", path: "/dashboard/downloads" },
        { label: t("nav.post"), icon: "fal fa-newspaper", path: "/dashboard/posts" },
        { label: t("nav.job"), icon: "fal fa-user-hard-hat", path: "/dashboard/jobs" },
    ];

    const router = useRouter();

    const handleQuickCreate = (path) => {
        router.push(`${path}?action=add`);
    };

    const handleLogout = () => {
        confirmAction({
            title: t("confirm.logoutTitle"),
            message: t("confirm.logoutMessage"),
            confirmLabel: t("confirm.logout"),
            onConfirm: async () => {
                await logout();
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
                        <input type="text" className="form-control" placeholder={t("nav.search")} />
                        <button className="shortcut-hint" type="button"> <i className="fal fa-search"></i> </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="d-flex align-items-center gap-2 actions-wrapper flex-wrap mt-3 mt-lg-0">

                    {/* Add New Button */}
                    <div className="dropdown quick-create">
                        <button className="butn-st2 blue-butn butn-md d-flex align-items-center gap-2 after-none" data-bs-toggle="dropdown">
                            <i className="fal fa-plus-circle"></i>
                            <span>{t("nav.addNew")}</span>
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
                        <div className="dropdown d-none d-sm-block">
                            <button
                                className="icon-btn dropdown-toggle after-none"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                title={t("common.language")}
                            >
                                <i className="fal fa-globe"></i>
                                <span className="ms-1 fsz-11 text-uppercase">{locale}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm">
                                <li>
                                    <button
                                        type="button"
                                        className={`dropdown-item fsz-13 ${locale === "en" ? "active" : ""}`}
                                        onClick={() => handleLocale("en")}
                                    >
                                        English
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className={`dropdown-item fsz-13 ${locale === "ar" ? "active" : ""}`}
                                        onClick={() => handleLocale("ar")}
                                    >
                                        العربية
                                    </button>
                                </li>
                            </ul>
                        </div>
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
                                    <i className="fal fa-gear me-2"></i> {t("nav.settingsLink")}
                                </Link>
                            </li>
                            <li>
                                <button className="dropdown-item text-danger py-2 fsz-13" onClick={handleLogout}>
                                    <i className="fal fa-sign-out me-2"></i> {t("nav.signOut")}
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
