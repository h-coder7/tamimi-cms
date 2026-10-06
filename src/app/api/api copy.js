import axios from "axios";

const api = axios.create({
  baseURL: "https://crmportal.skybridgeworld.com/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en",
  },
});

// Add token from localStorage to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
