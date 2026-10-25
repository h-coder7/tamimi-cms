"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { confirmAction } from "@/utils/confirm";
import { publicPath } from "@/utils/publicPath";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/hooks/useI18n";

export default function SideMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const { user: authUser, logout } = useAuth();
    const { t } = useI18n();
    const user = {
        name: authUser?.name || t("admins.title"),
        email: authUser?.email || "",
    };

    const isActive = (path) => {
        if (!pathname) return false;
        if (pathname === path || pathname === `${path}/`) return true;
        if (path !== "/dashboard" && pathname.startsWith(`${path}/`)) return true;
        return false;
    };

    return (
        <aside className="sidemenu">
            <div className="top-cont">
                <div className="logo-wrapper">
                    <Link href="/dashboard" prefetch={false} className="logo position-relative d-block" style={{ width: "40px", height: "40px" }}>
                        <Image
                            src={publicPath("/images/logo.png")}
                            alt={t("nav.logoAlt")}
                            fill
                            className="img-contain"
                        />
                    </Link>
                </div>

                <div className="sidemenu-links pt-4">
                    <ul className="links">
                        <li>
                            <Link href="/dashboard" prefetch={false} className={`lnk ${isActive("/dashboard") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-chart-simple"></i>
                                </span>
                                <span className="txt">{t("nav.dashboard")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/pages" prefetch={false} className={`lnk ${isActive("/dashboard/pages") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-file-alt"></i>
                                </span>
                                <span className="txt">{t("nav.pages")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/companies" prefetch={false} className={`lnk ${isActive("/dashboard/companies") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-building"></i>
                                </span>
                                <span className="txt">{t("nav.companies")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/industries" prefetch={false} className={`lnk ${isActive("/dashboard/industries") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-industry"></i>
                                </span>
                                <span className="txt">{t("nav.industries")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/projects" prefetch={false} className={`lnk ${isActive("/dashboard/projects") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-briefcase"></i>
                                </span>
                                <span className="txt">{t("nav.projects")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/clients-partners" prefetch={false} className={`lnk ${isActive("/dashboard/clients-partners") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-handshake"></i>
                                </span>
                                <span className="txt">{t("nav.clients")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/certificates" prefetch={false} className={`lnk ${isActive("/dashboard/certificates") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-certificate"></i>
                                </span>
                                <span className="txt">{t("nav.certificates")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/posts" prefetch={false} className={`lnk ${isActive("/dashboard/posts") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-newspaper"></i>
                                </span>
                                <span className="txt">{t("nav.posts")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/jobs" prefetch={false} className={`lnk ${isActive("/dashboard/jobs") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-user-hard-hat"></i>
                                </span>
                                <span className="txt">{t("nav.jobs")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/applications" prefetch={false} className={`lnk ${isActive("/dashboard/applications") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-file-user"></i>
                                </span>
                                <span className="txt">{t("nav.applications")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/messages" prefetch={false} className={`lnk ${isActive("/dashboard/messages") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-envelope"></i>
                                </span>
                                <span className="txt">{t("nav.messages")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/downloads" prefetch={false} className={`lnk ${isActive("/dashboard/downloads") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-download"></i>
                                </span>
                                <span className="txt">{t("nav.downloads")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/seo" prefetch={false} className={`lnk ${isActive("/dashboard/seo") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-search"></i>
                                </span>
                                <span className="txt">{t("nav.seo")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/users" prefetch={false} className={`lnk ${isActive("/dashboard/users") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-users"></i>
                                </span>
                                <span className="txt">{t("nav.admins")}</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/settings" prefetch={false} className={`lnk ${isActive("/dashboard/settings") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-gear"></i>
                                </span>
                                <span className="txt">{t("nav.settings")}</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="btm-cont px-3">
                <div className="user-wrapper">
                    <div className="avatar position-relative" style={{ width: "40px", height: "40px" }}>
                        <Image
                            src={publicPath("/images/av2.png")}
                            alt={t("nav.avatarAlt")}
                            fill
                            className="object-fit-cover rounded-circle"
                        />
                    </div>

                    <div className="inf">
                        <h6>{user.name}</h6>
                        <small>{user.email}</small>
                    </div>

                    <button
                        className="btn border-0 p-0 ms-auto text-danger"
                        onClick={() => {
                            confirmAction({
                                title: t("confirm.logoutTitle"),
                                message: t("confirm.logoutMessage"),
                                confirmLabel: t("confirm.logout"),
                                onConfirm: async () => {
                                    await logout();
                                    router.replace("/login");
                                },
                            });
                        }}
                        title={t("confirm.logout")}
                    >
                        <i className="fal fa-sign-out fa-lg"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
