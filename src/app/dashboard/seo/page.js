"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const SeoClient = dynamic(
  () => import("@/components/dashboard/seo/SeoClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading SEO…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading SEO…</div>}>
      <SeoClient />
    </Suspense>
  );
}
