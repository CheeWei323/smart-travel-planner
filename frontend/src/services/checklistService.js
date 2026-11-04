import api from "./api";
export const getChecklist = async (tripId) =>
  (await api.get(`/checklists/${tripId}`)).data;
export const addChecklistItem = async (tripId, task) =>
  (await api.post("/checklists", { tripId, task })).data;
export const updateChecklistItem = async (id, data) =>
  (await api.put(`/checklists/${id}`, data)).data;
export const deleteChecklistItem = async (id) =>
  (await api.delete(`/checklists/${id}`)).data;
