import { Suspense } from "react";
import CertificatesClient from "@/components/dashboard/certificates/CertificatesClient";

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading certificates...</div>}>
      <CertificatesClient />
    </Suspense>
  );
}
