"use client";

import { useCallback, useEffect, useState } from "react";
import { getLocale } from "@/lib/locale";
import { pickLocaleText, statusLabel, translate } from "@/lib/i18n";

export function useI18n() {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    setLocaleState(getLocale());
    const onChange = (event) => setLocaleState(event.detail || getLocale());
    window.addEventListener("cms-locale-change", onChange);
    return () => window.removeEventListener("cms-locale-change", onChange);
  }, []);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);
  const statusText = useCallback((value) => statusLabel(locale, value), [locale]);
  const text = useCallback(
    (value, fallback = "") => pickLocaleText(value, locale, fallback),
    [locale]
  );

  return { locale, t, isRtl: locale === "ar", statusText, text };
}
