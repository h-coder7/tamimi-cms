"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const MessagesClient = dynamic(
  () => import("@/components/dashboard/messages/MessagesClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading messages…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading messages…</div>}>
      <MessagesClient />
    </Suspense>
  );
}
