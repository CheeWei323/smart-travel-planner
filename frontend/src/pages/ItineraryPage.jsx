import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaPlane, FaHotel, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import axios from "axios";

// Helper function to get coordinates from city name using Nominatim (free, no API key)
const getCoordinates = async (cityName) => {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: cityName,
        format: "json",
        limit: 1,
      },
    });
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    throw new Error("City not found");
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export default function ItineraryPage() {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For demo, using "New York, USA". You can later replace with dynamic trip destination.
  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      setError("");
      const coords = await getCoordinates("New York, USA");
      if (coords) {
        setCoordinates(coords);
      } else {
        setError("Could not find location. Using default map view.");
        setCoordinates({ lat: 40.7128, lng: -74.006 }); // Fallback to New York
      }
      setLoading(false);
    };
    fetchCoordinates();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* HEADER */}
      <div>
        <h2 style={{ margin: 0 }}>New York, USA</h2>
        <p style={{ margin: 0, color: "gray" }}>10 Jan - 15 Jan • Active Trip</p>
      </div>

      {/* PROGRESS */}
      <div>
        <p style={{ margin: "0 0 5px 0" }}>Trip Progress</p>
        <div style={{ width: "100%", height: "10px", background: "#e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ width: "65%", height: "100%", background: "#2563eb" }} />
        </div>
      </div>

      {/* MAP SECTION – Safe rendering */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Trip Location</h3>
        {loading ? (
          <p style={{ padding: "15px" }}>Loading map...</p>
        ) : error ? (
          <p style={{ padding: "15px", color: "red" }}>{error}</p>
        ) : coordinates ? (
          <div style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </MapContainer>
          </div>
        ) : null}
      </div>

      {/* TIMELINE (unchanged) */}
      <div>
        <h3>Itinerary</h3>
        <DayCard day="Day 1 - Arrival" items={["✈ Flight KL → New York", "🏨 Hotel check-in", "🌆 Evening walk at Times Square"]} />
        <DayCard day="Day 2 - City Tour" items={["🗽 Statue of Liberty", "🌳 Central Park", "🎭 Broadway Show"]} />
        <DayCard day="Day 3 - Shopping" items={["🛍 5th Avenue", "🏙 Soho District"]} />
      </div>

      {/* BOOKINGS */}
      <div>
        <h3>Bookings</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <BookingCard icon={<FaPlane />} title="Flight" desc="KL → New York" />
          <BookingCard icon={<FaHotel />} title="Hotel" desc="Marriott Hotel" />
          <BookingCard icon={<FaMapMarkerAlt />} title="Transport" desc="Airport Pickup" />
        </div>
      </div>

      {/* BUDGET */}
      <div style={{ padding: "15px", background: "#0f172a", color: "white", borderRadius: "12px" }}>
        <h3 style={{ margin: 0 }}>Budget</h3>
        <p style={{ margin: "5px 0" }}>Total: RM 5,200</p>
        <p style={{ margin: 0 }}>Spent: RM 3,400</p>
      </div>

      {/* SMART SUGGESTIONS */}
      <div style={{ padding: "15px", borderRadius: "12px", background: "#f1f5f9" }}>
        <h3 style={{ marginTop: 0 }}>Smart Suggestions</h3>
        <p style={{ margin: 0 }}>⚠ You still need to book a restaurant for Day 2</p>
        <p style={{ margin: 0 }}>💡 Add Central Park picnic experience</p>
      </div>

      {/* ADD BUTTON */}
      <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", justifyContent: "center" }}>
        <FaPlus /> Add Activity
      </button>
    </div>
  );
}

// DayCard Component
function DayCard({ day, items }) {
  return (
    <div style={{ background: "white", padding: "15px", borderRadius: "12px", marginTop: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 10px 0" }}>{day}</h4>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: "5px" }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// BookingCard Component
function BookingCard({ icon, title, desc }) {
  return (
    <div style={{ flex: "1", background: "white", padding: "12px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ fontSize: "20px", color: "#2563eb" }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontWeight: "bold" }}>{title}</p>
        <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>{desc}</p>
      </div>
    </div>
  );
}

// Shared styles
const sectionStyle = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  overflow: "hidden",
};

const titleStyle = {
  margin: 0,
  padding: "15px 15px 0 15px",
};