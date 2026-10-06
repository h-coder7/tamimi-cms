import { Suspense } from "react";
import PagesClient from "@/components/dashboard/pages/PagesClient";

export default function PagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading pages...</div>}>
      <PagesClient />
    </Suspense>
  );
}
