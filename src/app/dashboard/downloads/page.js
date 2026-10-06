import { Suspense } from "react";
import DownloadsClient from "@/components/dashboard/downloads/DownloadsClient";

export default function DownloadsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading downloads...</div>}>
      <DownloadsClient />
    </Suspense>
  );
}
