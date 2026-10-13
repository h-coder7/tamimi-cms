"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ApplicationsClient = dynamic(
  () => import("@/components/dashboard/applications/ApplicationsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading applications…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading applications…</div>}>
      <ApplicationsClient />
    </Suspense>
  );
}
