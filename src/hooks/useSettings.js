"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { getApiErrorMessage } from "@/app/api/api";
import { t } from "@/lib/i18n";
import {
  settingsFromApi,
  settingsToApiPayload,
} from "@/lib/mappers/settings";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return settingsFromApi(res.data?.data);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form) => {
      const res = await api.patch("/settings", settingsToApiPayload(form));
      return settingsFromApi(res.data?.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(t("toast.settings.saved"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("toast.settings.couldNotSave")));
    },
  });
}
