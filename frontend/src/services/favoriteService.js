import axios from "axios";

const API_URL = "http://localhost:5000/api/favorites";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getFavorites = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

export const addFavorite = async (destination) => {
  const res = await axios.post(API_URL, { destination }, getAuthHeader());
  return res.data;
};

export const deleteFavorite = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};