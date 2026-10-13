"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getApiErrorMessage } from "@/app/api/api";
import {
  applicationFromApi,
  applicationToFormData,
} from "@/lib/mappers/applications";
import { toast } from "react-hot-toast";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await api.get("/applications", {
        params: { page: 1, perPage: 100, sort: "-submittedAt" },
      });
      return (res.data?.data || []).map(applicationFromApi);
    },
  });
}

export function useAddApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = applicationToFormData(form);
      const res = await api.post("/applications", formData);
      return applicationFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Application added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add application"));
    },
  });
}

/** Download CSV with optional filters (jobId, q, from, to). */
export async function exportApplicationsCsv(params = {}) {
  try {
    const res = await api.get("/applications/export", {
      params,
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not export applications"));
    throw error;
  }
}

/** Fetch CV as a blob URL (caller must revokeObjectURL when done). */
export async function fetchApplicationCvBlobUrl(application) {
  if (!application?.id || !application.cv) {
    throw new Error("No CV available");
  }
  const res = await api.get(`/applications/${application.id}/cv`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

/** Authenticated CV download via API stream. */
export async function downloadApplicationCv(application) {
  if (!application?.id || !application.cv) {
    toast.error("No CV available for this application");
    return;
  }
  try {
    const url = await fetchApplicationCvBlobUrl(application);
    const link = document.createElement("a");
    link.href = url;
    const safeName = String(application.name || "applicant")
      .replace(/\s+/g, "-")
      .toLowerCase();
    link.download = `${safeName}-cv.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not download CV"));
  }
}
