"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ProjectsClient = dynamic(
  () => import("@/components/dashboard/projects/ProjectsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading projects…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading projects…</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
