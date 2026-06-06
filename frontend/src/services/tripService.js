import axios from "axios";

const API_URL = "http://localhost:5000/api/trips";

// CREATE
export const createTrip = async (tripData) => {
  const res = await axios.post(API_URL, tripData);
  return res.data;
};

// GET ALL
export const getTrips = async () => {
  const res = await axios.get(API_URL);

  console.log("RAW API RESPONSE:", res.data); // DEBUG

  return res.data;
};

// DELETE
export const deleteTrip = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

// UPDATE
export const updateTrip = async (id, updatedData) => {
  return await axios.put(`${API_URL}/${id}`, updatedData);
};