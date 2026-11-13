import api from "./api";
export const getWeatherByCity = async (city, signal) =>
  (await api.get("/integrations/weather", { params: { city }, signal })).data;
