import api from "./api";
export const getCoordinates = async (city) => {
  const { data } = await api.get("/integrations/locations", {
    params: { q: city },
  });
  return data[0] ? { latitude: data[0].lat, longitude: data[0].lon } : null;
};
