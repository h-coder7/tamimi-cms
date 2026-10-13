"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const SettingsClient = dynamic(
  () => import("@/components/dashboard/settings/SettingsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading settings…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading settings…</div>}>
      <SettingsClient />
    </Suspense>
  );
}
