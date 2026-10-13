"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ApplicationsTable from "./ApplicationsTable";
import ApplicationDetailsOffcanvas from "./ApplicationDetailsOffcanvas";
import ApplicationModal from "./ApplicationModal";
import {
  exportApplicationsCsv,
  useAddApplication,
  useApplications,
} from "@/hooks/useApplications";

export default function ApplicationsClient() {
  const { data: applications = [], isLoading } = useApplications();
  const addMutation = useAddApplication();
  const [viewApplication, setViewApplication] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleView = (application) => {
    setViewApplication(application);
    setShowOffcanvas(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportApplicationsCsv();
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async (form) => {
    await addMutation.mutateAsync(form);
    setIsModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Applications"
        icon="fal fa-file-user"
        titleCol="col-lg-5"
        actionCol="col-lg-7"
      >
        <button
          type="button"
          className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fal fa-plus"></i>
          <span className="txt ms-2">Add application</span>
        </button>
        <button
          type="button"
          className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
          onClick={handleExport}
          disabled={exporting}
        >
          <i className="fal fa-file-csv"></i>
          <span className="txt ms-2">
            {exporting ? "Exporting..." : "Export CSV"}
          </span>
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center py-5 text-muted">Loading applications...</div>
      ) : (
        <ApplicationsTable data={applications} onView={handleView} />
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

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
