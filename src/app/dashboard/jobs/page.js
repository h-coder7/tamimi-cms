"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const JobsClient = dynamic(
  () => import("@/components/dashboard/jobs/JobsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading jobs…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading jobs…</div>}>
      <JobsClient />
    </Suspense>
  );
}
