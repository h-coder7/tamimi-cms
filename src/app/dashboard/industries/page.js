import { Suspense } from "react";
import IndustriesClient from "@/components/dashboard/industries/IndustriesClient";

export default function IndustriesPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading industries...</div>}>
      <IndustriesClient />
    </Suspense>
  );
}
