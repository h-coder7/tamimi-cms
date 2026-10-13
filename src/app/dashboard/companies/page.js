"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const CompaniesClient = dynamic(
  () => import("@/components/dashboard/companies/CompaniesClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading companies…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading companies…</div>}>
      <CompaniesClient />
    </Suspense>
  );
}
