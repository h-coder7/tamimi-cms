"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getApiErrorMessage } from "@/app/api/api";
import { messageFromApi, messageToFormData } from "@/lib/mappers/messages";
import { toast } from "react-hot-toast";

export const MESSAGE_TYPES = ["Inquiry", "Contact"];
export const MESSAGE_STATUSES = ["New", "Read"];

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await api.get("/messages", {
        params: { page: 1, perPage: 100, sort: "-receivedAt" },
      });
      return (res.data?.data || []).map(messageFromApi);
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const formData = messageToFormData(form);
      const res = await api.post("/messages", formData);
      return messageFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message added successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add message"));
    },
  });
}

export function useMarkMessageUnread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/messages/${id}/unread`);
      return messageFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Marked as unread");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not mark unread"));
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/messages/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message moved to trash");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete message"));
    },
  });
}

/** Fetch one message (marks as read on the server). */
export async function fetchMessageDetails(id) {
  const res = await api.get(`/messages/${id}`);
  return messageFromApi(res.data?.data);
}

/** Download CSV with optional filters. */
export async function exportMessagesCsv(params = {}) {
  try {
    const res = await api.get("/messages/export", {
      params,
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not export messages"));
    throw error;
  }
}

/** Download a message attachment via authenticated stream. */
export async function downloadMessageAttachment(message, attachment) {
  if (!message?.id || !attachment?.fileId) {
    toast.error("Attachment not available");
    return;
  }
  try {
    const res = await api.get(
      `/messages/${message.id}/attachments/${attachment.fileId}`,
      { responseType: "blob" }
    );
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.name || "attachment.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not download attachment"));
  }
}
