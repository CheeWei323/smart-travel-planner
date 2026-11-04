import api from "./api";
export const submitFeedback = async (data) =>
  (await api.post("/feedback", data)).data;
export const getMyFeedback = async () => (await api.get("/feedback/mine")).data;
export const getActiveAnnouncements = async () =>
  (await api.get("/feedback/announcements")).data;
