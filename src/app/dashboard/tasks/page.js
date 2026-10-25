"use client";

import { useI18n } from "@/hooks/useI18n";

export default function TasksPage() {
  const { t } = useI18n();
  return (
    <div className="container py-5">
      <h1>{t("tasks.title")}</h1>
      <p>
        {t("tasks.body")}
      </p>
    </div>
  );
}
