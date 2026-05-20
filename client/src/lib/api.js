import axios from "axios";

function isLoopbackHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL || "/api";

  if (typeof window === "undefined" || !/^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }

  try {
    const parsedUrl = new URL(configuredUrl);

    if (isLoopbackHost(window.location.hostname) && isLoopbackHost(parsedUrl.hostname)) {
      return "/api";
    }
  } catch {
    return configuredUrl;
  }

  return configuredUrl;
}

const API_URL = resolveApiUrl();

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
let isRefreshing = false;
const refreshQueue = [];

function notifyRefreshQueue(error) {
  refreshQueue.forEach((callback) => callback(error));
  refreshQueue.length = 0;
}

async function ensureCsrfToken() {
  const existing = readCookie("lfc_csrf");
  if (existing) return decodeURIComponent(existing);

  if (!csrfPromise) {
    csrfPromise = rawApi.get("/auth/csrf").finally(() => {
      csrfPromise = null;
    });
  }

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

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/csrf")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((refreshError) => {
            if (refreshError) {
              reject(refreshError);
            } else {
              resolve(api(original));
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        notifyRefreshQueue(null);
        return api(original);
      } catch (refreshError) {
        notifyRefreshQueue(refreshError);
        localStorage.removeItem("lfc_user");
        if (!original.url?.includes("/auth/me")) {
          window.dispatchEvent(new Event("lfc:session-expired"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data?.data ?? response.data;
}

export default api;
