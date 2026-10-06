import { Suspense } from "react";
import JobsClient from "@/components/dashboard/jobs/JobsClient";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading jobs...</div>}>
      <JobsClient />
    </Suspense>
  );
}
