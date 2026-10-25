import { getLocale } from "@/lib/locale";
import { en } from "@/locales/ui.en";
import { ar } from "@/locales/ui.ar";

const catalogs = { en, ar };

/**
 * @param {"en"|"ar"|string} locale
 * @param {string} key
 * @param {Record<string, string|number>|undefined} vars
 */
export function translate(locale, key, vars) {
  const lang = locale === "ar" ? "ar" : "en";
  let text = catalogs[lang][key] ?? catalogs.en[key] ?? key;
  if (vars && typeof text === "string") {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, value == null ? "" : String(value));
    }
  }
  return text;
}

/** Read the active locale at call time (toasts, confirms). */
export function t(key, vars) {
  return translate(getLocale(), key, vars);
}

/** Translate a fixed enum label. API/filter values stay in English. */
export function statusLabel(locale, value) {
  if (value == null || value === "") return "";
  const key = `status.${value}`;
  const translated = translate(locale, key);
  return translated === key ? String(value) : translated;
}

/**
 * Prefer the active language on a `{en, ar}` value.
 * Does not change how forms save those fields.
 */
export function pickLocaleText(value, locale, fallback = "") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return fallback;
  if (typeof value === "object") {
    if (locale === "ar") return value.ar || value.en || fallback;
    return value.en || value.ar || fallback;
  }
  return fallback;
}
