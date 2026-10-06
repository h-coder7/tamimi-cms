import { Suspense } from "react";
import PostsClient from "@/components/dashboard/posts/PostsClient";

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading posts...</div>}>
      <PostsClient />
    </Suspense>
  );
}
