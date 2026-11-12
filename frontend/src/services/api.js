import axios from "axios";
import { endStoredSession, getSessionId, getSessionRevision,
  getCsrfToken, setCsrfToken } from "../utils/session";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  withCredentials: true,
});
let csrfRequest;
const changedSession = () => new Error("Your session changed. Refresh the page before trying again.");
async function ensureCsrf() {
  if (getCsrfToken()) return getCsrfToken();
  if (!csrfRequest) {
    const started = getSessionRevision();
    csrfRequest = client.get("/auth/csrf").then(({ data }) => {
      if (getSessionRevision() !== started) throw changedSession();
      setCsrfToken(data.csrfToken);
      return data.csrfToken;
    }).finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

async function request(method, url, data, options = {}) {
  // Capture identity before awaiting anything. A stale form must not acquire a
  // new account's CSRF token and silently submit against that account.
  const identity = getSessionId();
  const started = getSessionRevision();
  const unsafe = !["get", "head", "options"].includes(method);
  let csrf = getCsrfToken();
  if (unsafe && !csrf) {
    if (identity) throw changedSession();
    csrf = await ensureCsrf();
  }
  if (getSessionRevision() !== started) throw changedSession();
  try {
    return await client.request({ ...options, method, url, data,
      headers: { ...options.headers, ...(unsafe ? { "X-CSRF-Token": csrf } : {}) } });
  } catch (error) {
    const message = error.response?.data?.message || "";
    if (getSessionRevision() === started && url !== "/auth/login" &&
        !(url === "/auth/me" && identity === null) &&
        (error.response?.status === 401 ||
          (error.response?.status === 403 && message.toLowerCase().includes("suspended"))))
      endStoredSession(message || "Please log in again.", identity);
    throw error;
  }
}

const api = {
  get: (url, options) => request("get", url, undefined, options),
  post: (url, data, options) => request("post", url, data, options),
  put: (url, data, options) => request("put", url, data, options),
  patch: (url, data, options) => request("patch", url, data, options),
  delete: (url, options) => request("delete", url, options?.data, options),
};
export const errorMessage = (error) => error.response?.data?.message ||
  (error.code === "ECONNABORTED" ? "The request took too long. Please try again."
    : !error.response && !error.request && error.message ? error.message
      : "Could not connect. Check your connection and try again.");
export default api;
