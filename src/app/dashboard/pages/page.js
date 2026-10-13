"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const PagesClient = dynamic(
  () => import("@/components/dashboard/pages/PagesClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading pages…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading pages…</div>}>
      <PagesClient />
    </Suspense>
  );
}
