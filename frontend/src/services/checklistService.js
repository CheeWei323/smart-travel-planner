import axios from "axios";

const API_URL = "http://localhost:5000/api/checklists";

// Helper to get the token
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getChecklist = async (tripId) => {
  const res = await axios.get(`${API_URL}/${tripId}`, getAuthHeader());
  return res.data;
};

export const addChecklistItem = async (tripId, task) => {
  const res = await axios.post(API_URL, { tripId, task }, getAuthHeader());
  return res.data;
};

export const updateChecklistItem = async (id, updatedData) => {
  const res = await axios.put(`${API_URL}/${id}`, updatedData, getAuthHeader());
  return res.data;
};

export const deleteChecklistItem = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};