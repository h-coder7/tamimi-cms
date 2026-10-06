import { Suspense } from "react";
import PageEditorClient from "@/components/dashboard/pages/PageEditorClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: String(index + 1),
  }));
}

export default function PageEditRoute() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading editor...</div>}>
      <PageEditorClient />
    </Suspense>
  );
}
