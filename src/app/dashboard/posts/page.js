"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const PostsClient = dynamic(
  () => import("@/components/dashboard/posts/PostsClient"),
  {
    loading: () => (
      <div className="text-center py-5 text-muted">Loading posts…</div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading posts…</div>}>
      <PostsClient />
    </Suspense>
  );
}
