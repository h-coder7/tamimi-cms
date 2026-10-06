"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const pathname = usePathname();
    const redirectedRef = useRef(false);

    useEffect(() => {
        if (redirectedRef.current) return;
        if (pathname !== "/") return;

        redirectedRef.current = true;
        const token = localStorage.getItem("token");
        router.replace(token ? "/dashboard" : "/login");
    }, [pathname, router]);

    return (
        <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="text-center">
                <div className="spinner-border mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Redirecting...</h5>
            </div>
        </div>
    );
}
