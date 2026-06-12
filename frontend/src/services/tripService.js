import axios from "axios";

const API_URL = "http://localhost:5000/api/trips";

// Helper function to attach the JWT token to requests
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// CREATE
export const createTrip = async (tripData) => {
  const res = await axios.post(API_URL, tripData, getAuthHeader());
  return res.data;
};

// GET ALL
export const getTrips = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

// DELETE
export const deleteTrip = async (id) => {
  return await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};

// UPDATE
export const updateTrip = async (id, updatedData) => {
  return await axios.put(`${API_URL}/${id}`, updatedData, getAuthHeader());
};