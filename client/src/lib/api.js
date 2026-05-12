import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Accept": "application/json"
  }
});

const rawApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Accept": "application/json"
  }
});

function readCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

let csrfPromise;

async function ensureCsrfToken() {
  const existing = readCookie("lfc_csrf");
  if (existing) return decodeURIComponent(existing);

  csrfPromise ||= rawApi.get("/auth/csrf").finally(() => {
    csrfPromise = null;
  });

  const { data } = await csrfPromise;
  return data.data?.csrfToken || readCookie("lfc_csrf");
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method) && !config.url?.includes("/auth/csrf")) {
    config.headers["X-CSRF-Token"] = await ensureCsrfToken();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !original.url?.includes("/auth/refresh") && !original.url?.includes("/auth/login")) {
      original._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(original);
      } catch {
        localStorage.removeItem("lfc_user");
        if (!original.url?.includes("/auth/me")) {
          window.dispatchEvent(new Event("lfc:session-expired"));
        }
      }
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data?.data ?? response.data;
}

export default api;
