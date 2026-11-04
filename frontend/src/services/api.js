import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "";
    const isLogin = error.config?.url === "/auth/login";
    if (
      (!isLogin && error.response?.status === 401) ||
      (error.response?.status === 403 &&
        message.toLowerCase().includes("suspended"))
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(
        new CustomEvent("travelwise:session-ended", {
          detail: message || "Please log in again.",
        }),
      );
    }
    return Promise.reject(error);
  },
);
export const errorMessage = (error) =>
  error.response?.data?.message ||
  (error.code === "ECONNABORTED"
    ? "The request took too long. Please try again."
    : "Could not connect. Check your connection and try again.");
export default api;
