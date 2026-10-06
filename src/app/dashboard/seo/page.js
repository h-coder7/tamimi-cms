import { Suspense } from "react";
import SeoClient from "@/components/dashboard/seo/SeoClient";

export default function SeoPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading SEO...</div>}>
      <SeoClient />
    </Suspense>
  );
}
