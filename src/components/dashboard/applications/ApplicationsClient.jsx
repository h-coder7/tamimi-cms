"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ApplicationsTable from "./ApplicationsTable";
import ApplicationDetailsOffcanvas from "./ApplicationDetailsOffcanvas";
import { useApplications } from "@/hooks/useApplications";

export default function ApplicationsClient() {
    const { data: applications = [], isLoading } = useApplications();
    const [viewApplication, setViewApplication] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleView = (application) => {
        setViewApplication(application);
        setShowOffcanvas(true);
    };

    return (
        <>
            <PageHeader
                title="Applications"
                icon="fal fa-file-user"
                titleCol="col-lg-8"
                actionCol="col-lg-4"
            />

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading applications...</div>
            ) : (
                <ApplicationsTable
                    data={applications}
                    onView={handleView}
                />
            )}

            <ApplicationDetailsOffcanvas
                show={showOffcanvas}
                application={viewApplication}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewApplication(null);
                }}
            />
        </>
    );
}
