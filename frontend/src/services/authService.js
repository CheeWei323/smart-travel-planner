import api from "./api";

export const registerUser = async (data) =>
  (await api.post("/auth/register", data)).data;

export const updateProfile = async (data) =>
  (await api.put("/auth/profile", data)).data;

export const deleteAccount = async (password) =>
  (await api.delete("/auth/profile", { data: { password } })).data;

export const exportUserData = async () =>
  (await api.get("/auth/export")).data;