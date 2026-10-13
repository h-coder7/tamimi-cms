const STORAGE_KEY = "cms_locale";

/** @returns {"en"|"ar"} */
export function getLocale() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

/** @param {"en"|"ar"} locale */
export function setLocale(locale) {
  const next = locale === "ar" ? "ar" : "en";
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, next);
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  window.dispatchEvent(new CustomEvent("cms-locale-change", { detail: next }));
}

export function toggleLocale() {
  setLocale(getLocale() === "ar" ? "en" : "ar");
}
