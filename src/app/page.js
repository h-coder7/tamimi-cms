"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (redirectedRef.current || loading) return;
    if (pathname !== "/") return;

    redirectedRef.current = true;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [pathname, router, isAuthenticated, loading]);

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
