import api from "./api";
export const getFavorites = async () => (await api.get("/favorites")).data;
export const addFavorite = async (destination) =>
  (await api.post("/favorites", { destination })).data;
export const deleteFavorite = async (id) =>
  (await api.delete(`/favorites/${id}`)).data;
