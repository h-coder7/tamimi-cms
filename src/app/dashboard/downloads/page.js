"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const DownloadsClient = dynamic(
  () => import("@/components/dashboard/downloads/DownloadsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading downloads…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading downloads…</div>}>
      <DownloadsClient />
    </Suspense>
  );
}
