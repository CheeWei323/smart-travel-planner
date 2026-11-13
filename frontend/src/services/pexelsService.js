import api from "./api";
const pending = new Map();
export const getPhotoForDestination = (destination) => {
  if (!pending.has(destination))
    pending.set(
      destination,
      api
        .get("/integrations/photo", { params: { destination } })
        .then(({ data }) => data)
        .catch(() => {
          pending.delete(destination);
          return { url: null };
        }),
    );
  return pending.get(destination);
};
export const getImageForDestination = async (destination) =>
  (await getPhotoForDestination(destination)).url || "/travel-cover.svg";
