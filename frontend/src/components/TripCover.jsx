import { useCallback } from "react";
import useResource from "../hooks/useResource";
import { getPhotoForDestination } from "../services/pexelsService";
export default function TripCover({ destination, className = "" }) {
  const load = useCallback(
    () => getPhotoForDestination(destination),
    [destination],
  );
  const { data } = useResource(load, null);
  return (
    <div className={`trip-cover ${className}`}>
      <img
        src={data?.url || "/travel-cover.svg"}
        alt={destination}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/travel-cover.svg";
        }}
      />
      {data?.photographer && (
        <a
          className="photo-credit"
          href={data.sourceUrl || data.photographerUrl}
          target="_blank"
          rel="noreferrer"
        >
          Photo: {data.photographer} / Pexels
        </a>
      )}
    </div>
  );
}
