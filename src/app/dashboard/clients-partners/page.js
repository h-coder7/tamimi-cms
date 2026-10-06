import { Suspense } from "react";
import ClientsPartnersClient from "@/components/dashboard/clients-partners/ClientsPartnersClient";

export default function ClientsPartnersPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading clients & partners...</div>}>
      <ClientsPartnersClient />
    </Suspense>
  );
}
