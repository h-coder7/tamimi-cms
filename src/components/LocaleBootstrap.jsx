"use client";

import { useEffect } from "react";
import { getLocale, setLocale } from "@/lib/locale";

/** Apply saved CMS locale (lang/dir) on first paint. */
export default function LocaleBootstrap() {
  useEffect(() => {
    setLocale(getLocale());
  }, []);
  return null;
}
