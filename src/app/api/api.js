import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en",
  },
});

// Add token from localStorage to requests (for crm)
api.interceptors.request.use(
  (config) => {
    if (!BASE_URL.includes("jsonplaceholder") && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
