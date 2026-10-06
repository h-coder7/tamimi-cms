"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { confirmAction } from "@/utils/confirm";
import { publicPath } from "@/utils/publicPath";

export default function SideMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState({ name: "Yasmin Ali", email: "YasminAli@gmail.com" });

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
                    <Link href="/dashboard" className="logo position-relative d-block" style={{ width: "40px", height: "40px" }}>
                        <Image
                            src={publicPath("/images/logo.png")}
                            alt="Logo"
                            fill
                            className="img-contain"
                        />
                    </Link>
                </div>

                <div className="sidemenu-links pt-4">
                    <ul className="links">
                        <li>
                            <Link href="/dashboard" className={`lnk ${isActive("/dashboard") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-chart-simple"></i>
                                </span>
                                <span className="txt">Dashboard</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/companies" className={`lnk ${isActive("/dashboard/companies") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-building"></i>
                                </span>
                                <span className="txt">Companies</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/industries" className={`lnk ${isActive("/dashboard/industries") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-industry"></i>
                                </span>
                                <span className="txt">Industries</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/projects" className={`lnk ${isActive("/dashboard/projects") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-briefcase"></i>
                                </span>
                                <span className="txt">Projects</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/clients-partners" className={`lnk ${isActive("/dashboard/clients-partners") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-handshake"></i>
                                </span>
                                <span className="txt">Clients & Partners</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/certificates" className={`lnk ${isActive("/dashboard/certificates") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-certificate"></i>
                                </span>
                                <span className="txt">Certificates</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/posts" className={`lnk ${isActive("/dashboard/posts") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-newspaper"></i>
                                </span>
                                <span className="txt">Posts</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/jobs" className={`lnk ${isActive("/dashboard/jobs") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-user-hard-hat"></i>
                                </span>
                                <span className="txt">Jobs</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/applications" className={`lnk ${isActive("/dashboard/applications") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-file-user"></i>
                                </span>
                                <span className="txt">Applications</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/messages" className={`lnk ${isActive("/dashboard/messages") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-envelope"></i>
                                </span>
                                <span className="txt">Messages</span>
                            </Link>
                        </li>

                        <li>
                            <Link href="/dashboard/settings" className={`lnk ${isActive("/dashboard/settings") ? "active" : ""}`}>
                                <span className="icon">
                                    <i className="fal fa-gear"></i>
                                </span>
                                <span className="txt">Settings</span>
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
                            alt="User Avatar"
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
                                title: "Logout?",
                                message: "Are you sure you want to logout?",
                                confirmLabel: "Logout",
                                onConfirm: () => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user");
                                    router.replace("/login");
                                },
                            });
                        }}
                        title="Logout"
                    >
                        <i className="fal fa-sign-out fa-lg"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
