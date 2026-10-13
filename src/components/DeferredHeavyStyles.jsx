"use client";

import { useEffect } from "react";

/** Load Font Awesome after first paint so it doesn't block navigation/TTI. */
export default function DeferredHeavyStyles() {
  useEffect(() => {
    void import("@/app/styles/lib/all.min.css");
  }, []);
  return null;
}
