import api from "./api";
export const getTrips = async () => (await api.get("/trips")).data;
export const getTrip = async (id) => (await api.get(`/trips/${id}`)).data;
export const createTrip = async (data) => (await api.post("/trips", data)).data;
export const updateTrip = async (id, data) =>
  (await api.put(`/trips/${id}`, data)).data;
export const deleteTrip = async (id) => (await api.delete(`/trips/${id}`)).data;
