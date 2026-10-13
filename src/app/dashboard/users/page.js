"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const UsersClient = dynamic(
  () => import("@/components/dashboard/users/UsersClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading admins…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading admins…</div>}>
      <UsersClient />
    </Suspense>
  );
}
