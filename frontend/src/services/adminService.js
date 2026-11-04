import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getStats = async () => (await axios.get(`${API_URL}/stats`, auth())).data;

// Users
export const getUsers = async (q = "") =>
  (await axios.get(`${API_URL}/users`, { ...auth(), params: { q } })).data;
export const updateUser = async (id, data) =>
  (await axios.put(`${API_URL}/users/${id}`, data, auth())).data;
export const deleteUser = async (id) =>
  (await axios.delete(`${API_URL}/users/${id}`, auth())).data;

// Trips
export const getAllTrips = async (q = "") =>
  (await axios.get(`${API_URL}/trips`, { ...auth(), params: { q } })).data;
export const deleteAnyTrip = async (id) =>
  (await axios.delete(`${API_URL}/trips/${id}`, auth())).data;

// Announcements
export const getAnnouncements = async () =>
  (await axios.get(`${API_URL}/announcements`, auth())).data;
export const createAnnouncement = async (data) =>
  (await axios.post(`${API_URL}/announcements`, data, auth())).data;
export const updateAnnouncement = async (id, data) =>
  (await axios.put(`${API_URL}/announcements/${id}`, data, auth())).data;
export const deleteAnnouncement = async (id) =>
  (await axios.delete(`${API_URL}/announcements/${id}`, auth())).data;

// Feedback
export const getAllFeedback = async () =>
  (await axios.get(`${API_URL}/feedback`, auth())).data;
export const updateFeedback = async (id, data) =>
  (await axios.put(`${API_URL}/feedback/${id}`, data, auth())).data;
export const deleteFeedback = async (id) =>
  (await axios.delete(`${API_URL}/feedback/${id}`, auth())).data;
