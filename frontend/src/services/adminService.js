import api from "./api";
export const getStats = async () => (await api.get("/admin/stats")).data;
export const getAuditLogs = async () =>
  (await api.get("/admin/audit-logs")).data;
export const getUsers = async (q = "") =>
  (await api.get("/admin/users", { params: { q } })).data;
export const updateUser = async (id, data) =>
  (await api.put(`/admin/users/${id}`, data)).data;
export const deleteUser = async (id) =>
  (await api.delete(`/admin/users/${id}`)).data;
export const getAllTrips = async (q = "") =>
  (await api.get("/admin/trips", { params: { q } })).data;
export const deleteAnyTrip = async (id) =>
  (await api.delete(`/admin/trips/${id}`)).data;
export const getAnnouncements = async () =>
  (await api.get("/admin/announcements")).data;
export const createAnnouncement = async (data) =>
  (await api.post("/admin/announcements", data)).data;
export const updateAnnouncement = async (id, data) =>
  (await api.put(`/admin/announcements/${id}`, data)).data;
export const deleteAnnouncement = async (id) =>
  (await api.delete(`/admin/announcements/${id}`)).data;
export const getAllFeedback = async (status = "") =>
  (await api.get("/admin/feedback", { params: { status } })).data;
export const updateFeedback = async (id, data) =>
  (await api.put(`/admin/feedback/${id}`, data)).data;
export const deleteFeedback = async (id) =>
  (await api.delete(`/admin/feedback/${id}`)).data;
