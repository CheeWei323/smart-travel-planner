import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
const activityIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const hotelIcon = L.divIcon({
  html: "<span>H</span>",
  className: "hotel-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
function Bounds({ points, center }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1)
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    else
      map.setView(
        points[0] || center || [4.2105, 101.9758],
        points.length || center ? 13 : 5,
      );
  }, [map, points, center]);
  return null;
}
export default function ItineraryMap({ hotel, locations, center }) {
  const points = useMemo(
    () => [
      ...(hotel ? [[hotel.lat, hotel.lon]] : []),
      ...locations.map((item) => [item.lat, item.lon]),
    ],
    [hotel, locations],
  );
  return (
    <MapContainer
      center={center || [4.2105, 101.9758]}
      zoom={7}
      className="itinerary-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Bounds points={points} center={center} />
      {hotel && (
        <Marker position={[hotel.lat, hotel.lon]} icon={hotelIcon}>
          <Popup>
            <strong>Hotel: {hotel.name}</strong>
            <br />
            {hotel.address}
          </Popup>
        </Marker>
      )}
      {locations.map((item, index) => (
        <Marker
          key={`${index}-${item.lat}-${item.lon}`}
          position={[item.lat, item.lon]}
          icon={activityIcon}
        >
          <Popup>
            <strong>
              Stop {index + 1}: {item.name}
            </strong>
            <br />
            {item.address}
          </Popup>
        </Marker>
      ))}
      {points.length > 1 && (
        <Polyline positions={points} color="#167c73" dashArray="8 8" />
      )}
    </MapContainer>
  );
}
