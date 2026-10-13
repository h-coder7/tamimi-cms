"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center text-muted">
          <div className="spinner-border spinner-border-sm mb-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="fsz-14">Loading…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return children;
}
