"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const IndustriesClient = dynamic(
  () => import("@/components/dashboard/industries/IndustriesClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading industries…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading industries…</div>}>
      <IndustriesClient />
    </Suspense>
  );
}
