import { Suspense } from "react";
import CompaniesClient from "@/components/dashboard/companies/CompaniesClient";

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading companies...</div>}>
      <CompaniesClient />
    </Suspense>
  );
}
