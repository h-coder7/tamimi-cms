import { Suspense } from "react";
import UsersClient from "@/components/dashboard/users/UsersClient";

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading users...</div>}>
      <UsersClient />
    </Suspense>
  );
}
