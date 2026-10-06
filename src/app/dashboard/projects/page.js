import { Suspense } from "react";
import ProjectsClient from "@/components/dashboard/projects/ProjectsClient";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading projects...</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
