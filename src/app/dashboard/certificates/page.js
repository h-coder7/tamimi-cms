"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const CertificatesClient = dynamic(
  () => import("@/components/dashboard/certificates/CertificatesClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading certificates…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading certificates…</div>}>
      <CertificatesClient />
    </Suspense>
  );
}
