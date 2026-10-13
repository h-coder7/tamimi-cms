"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ClientsPartnersClient = dynamic(
  () => import("@/components/dashboard/clients-partners/ClientsPartnersClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading clients…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading clients…</div>}>
      <ClientsPartnersClient />
    </Suspense>
  );
}
