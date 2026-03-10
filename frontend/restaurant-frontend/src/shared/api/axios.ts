import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createAdminApi = (adminKey?: string) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (adminKey) {
    instance.defaults.headers.common["X-Admin-Key"] = adminKey;
  }

  return instance;
};