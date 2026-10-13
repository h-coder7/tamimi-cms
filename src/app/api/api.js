import axios from "axios";
import { clearCsrfToken, getCsrfToken, setCsrfToken } from "@/lib/csrf";
import { getLocale } from "@/lib/locale";
import { te } from "@/locales/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api/v1/admin";

const MUTATING = new Set(["post", "put", "patch", "delete"]);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const locale = getLocale();
    config.headers["Accept-Language"] = locale;
    config.headers["X-Locale"] = locale;

    const method = (config.method || "get").toLowerCase();
    if (MUTATING.has(method)) {
      const csrf = getCsrfToken();
      if (csrf) {
        config.headers["X-CSRF-Token"] = csrf;
      }
    }

    // Let the browser set multipart boundary for FormData
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const csrf = response?.data?.data?.csrfToken;
    if (csrf) {
      setCsrfToken(csrf);
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      clearCsrfToken();
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback) {
  const locale = getLocale();
  const defaultFallback = fallback || te("errors.fallback", locale);

  if (!error?.response) {
    return te("errors.network", locale);
  }

  const code = error?.response?.data?.error?.code;
  const fields = error?.response?.data?.error?.fields;

  if (fields && typeof fields === "object") {
    const first = Object.values(fields).flat()[0];
    if (first) {
      // BE may return already-localized text, or a raw key as fallback
      if (typeof first === "string" && first.startsWith("errors.")) {
        return te(first, locale);
      }
      return first;
    }
  }

  if (code) {
    const keyed = te(`errors.code.${code}`, locale);
    if (keyed && keyed !== `errors.code.${code}`) return keyed;
  }

  return defaultFallback;
}

export default api;
