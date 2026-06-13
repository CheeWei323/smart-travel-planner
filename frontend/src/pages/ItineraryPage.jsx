import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaHotel, FaMapMarkerAlt, FaSearch, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { getTrips, updateTrip } from "../services/tripService";
import { getImageForDestination } from "../services/pexelsService";
import { getCoordinates } from "../services/geocodeService";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Default Blue Icon for Activities
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Red Icon for the Hotel/Base Camp
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ==========================================
// ROUTE OPTIMIZATION MATH
// ==========================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const getOptimizedRoute = (startPoint, locations) => {
  if (!startPoint || locations.length === 0) return locations;

  let unvisited = [...locations];
  let optimizedRoute = [];
  let currentLocation = startPoint;

  while (unvisited.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(
        currentLocation.lat, currentLocation.lon,
        unvisited[i].lat, unvisited[i].lon
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const nextStop = unvisited.splice(closestIndex, 1)[0];
    optimizedRoute.push(nextStop);
    currentLocation = nextStop; 
  }

  return optimizedRoute;
};

// ==========================================
// MAP AUTO-CENTER
// ==========================================
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ItineraryPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripCovers, setTripCovers] = useState({});
  const [tripCenter, setTripCenter] = useState([5.4141, 100.3288]); // Defaults to Penang
  
  const [dailyHotels, setDailyHotels] = useState({});
  const [dailyPlans, setDailyPlans] = useState({});
  const [activeDay, setActiveDay] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTarget, setSearchTarget] = useState("hotel"); 

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const loadCovers = async () => {
      const covers = {};
      for (const trip of trips) {
        const destName = trip.destination.split(',')[0].trim();
        const url = await getImageForDestination(destName);
        covers[trip._id] = url;
      }
      setTripCovers(covers);
    };

    if (trips.length > 0) {
      loadCovers();
    }
  }, [trips]);

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      const upcoming = (data?.trips || data || []).filter(
        (t) => new Date(t.endDate) >= new Date()
      );
      setTrips(upcoming);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const handleTripClick = async (trip) => {
    setSelectedTrip(trip);
    setDailyHotels(trip?.itinerary?.dailyHotels || {});
    setDailyPlans(trip?.itinerary?.days || {});
    setActiveDay(1);

    // Auto-locate the destination on the map
    const coords = await getCoordinates(trip.destination);
    if (coords) {
      setTripCenter([coords.latitude, coords.longitude]);
    }
  };

  const handleBackToTrips = () => {
    setSelectedTrip(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { 
          q: query, 
          format: 'json', 
          addressdetails: 1, 
          limit: 5 
        }
      });
      
      const results = res.data.map((f) => ({
        name: f.name || f.display_name.split(',')[0], 
        address: f.display_name,
        lat: parseFloat(f.lat),
        lon: parseFloat(f.lon),
      }));
      
      setSearchResults(results); 
    } catch (err) {
      console.error("Location search error:", err);
    }
  };

  const handleAddLocation = (loc) => {
    if (searchTarget === "hotel") {
      setDailyHotels(prev => ({ ...prev, [activeDay]: loc }));
    } else {
      setDailyPlans((prev) => ({
        ...prev,
        [activeDay]: [...(prev[activeDay] || []), loc],
      }));
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSaveItinerary = async () => {
    if (!selectedTrip) return;
    try {
      const updatedData = {
        itinerary: { dailyHotels, days: dailyPlans },
      };
      await updateTrip(selectedTrip._id, updatedData);
      alert("Itinerary saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save itinerary.");
    }
  };

  const totalDays = selectedTrip
    ? Math.ceil((new Date(selectedTrip.endDate) - new Date(selectedTrip.startDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const currentHotel = dailyHotels[activeDay] || null;
  const currentDayLocations = dailyPlans[activeDay] || [];
  
  const optimizedLocations = currentHotel 
    ? getOptimizedRoute(currentHotel, currentDayLocations) 
    : currentDayLocations;

  const mapCenter = currentHotel 
    ? [currentHotel.lat, currentHotel.lon] 
    : optimizedLocations.length > 0 
      ? [optimizedLocations[0].lat, optimizedLocations[0].lon] 
      : tripCenter; 
  
  const routeCoords = [];
  if (currentHotel) routeCoords.push([currentHotel.lat, currentHotel.lon]);
  optimizedLocations.forEach(loc => routeCoords.push([loc.lat, loc.lon]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* VIEW 1: TRIP SELECTION WITH DESTINATION COVERS */}
      {!selectedTrip ? (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Your Upcoming Trips</h3>
          <p style={{ margin: "5px 15px 15px 15px", color: "gray" }}>Select an upcoming trip below to view and edit its itinerary.</p>
          
          <div style={{ padding: "0 15px 20px 15px", display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {trips.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "gray" }}>No upcoming trips found. Go to Create Trip to add one!</p>
            ) : (
              trips.map((trip) => {
                const coverUrl = tripCovers[trip._id] || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80"; 

                return (
                  <div
                    key={trip._id}
                    onClick={() => handleTripClick(trip)}
                    style={{
                      position: "relative",
                      borderRadius: "16px",
                      width: "290px",
                      height: "200px",
                      cursor: "pointer",
                      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 100%), url(${coverUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "white",
                      overflow: "hidden",
                      transition: "all 0.25s ease-in-out",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "20px",
                      boxSizing: "border-box"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 12px 20px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", textShadow: "1px 1px 4px rgba(0,0,0,0.6)" }}>
                      {trip.destination}
                    </h4>
                    
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "6px", textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                      <FaCalendarAlt size={12} color="#cbd5e1" /> 
                      {new Date(trip.startDate).toLocaleDateString()}
                    </p>

                    <div style={{ marginTop: "12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold", color: "#60a5fa" }}>
                      Edit Itinerary →
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (

        /* VIEW 2: ITINERARY MAP PLATFORM */
        <>
          <div style={{ ...sectionStyle, padding: "15px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <button 
                onClick={handleBackToTrips}
                style={{ background: "none", border: "none", padding: "0 0 8px 0", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "bold" }}
                onMouseEnter={(e) => e.target.style.color = "#2563eb"}
                onMouseLeave={(e) => e.target.style.color = "#64748b"}
              >
                <FaArrowLeft /> Back to Trips
              </button>
              <h2 style={{ margin: 0, color: "#0f172a" }}>{selectedTrip.destination} Itinerary</h2>
              <p style={{ margin: 0, color: "gray", fontSize: "14px" }}>
                {new Date(selectedTrip.startDate).toLocaleDateString()} to {new Date(selectedTrip.endDate).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={handleSaveItinerary} 
              style={{ padding: "12px 24px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
              onMouseEnter={(e) => e.target.style.background = "#059669"}
              onMouseLeave={(e) => e.target.style.background = "#10b981"}
            >
              Save Itinerary
            </button>
          </div>

          <div style={{ ...sectionStyle, padding: "15px" }}>
            <h3 style={{ margin: "0 0 15px 0" }}>Add Locations for Day {activeDay}</h3>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button 
                onClick={() => setSearchTarget("hotel")}
                style={{ ...tabStyle, background: searchTarget === "hotel" ? "#2563eb" : "#e5e7eb", color: searchTarget === "hotel" ? "white" : "black" }}
              >
                <FaHotel /> Set Day {activeDay} Hotel
              </button>
              <button 
                onClick={() => setSearchTarget("activity")}
                style={{ ...tabStyle, background: searchTarget === "activity" ? "#2563eb" : "#e5e7eb", color: searchTarget === "activity" ? "white" : "black" }}
              >
                <FaMapMarkerAlt /> Add Day {activeDay} Activity
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", top: "12px", left: "10px", color: "gray" }} />
              <input
                type="text"
                placeholder={`Search for a ${searchTarget}...`}
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: "100%", padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              
              {searchResults.length > 0 && (
                <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", zIndex: 1000, listStyle: "none", margin: 0, padding: 0, border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                  {searchResults.map((res, i) => (
                    <li 
                      key={i} 
                      onClick={() => handleAddLocation(res)}
                      style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", color: "black" }}
                      onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                      onMouseLeave={(e) => e.target.style.background = "white"}
                    >
                      <strong>{res.name}</strong> <span style={{ fontSize: "12px", color: "gray" }}>{res.address}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "5px", paddingBottom: "5px" }}>
                {Array.from({ length: totalDays }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setActiveDay(i + 1)}
                    style={{ 
                      ...tabStyle, 
                      justifyContent: "center", 
                      padding: "8px 2px",       
                      fontSize: "12px",         
                      background: activeDay === i + 1 ? "#2563eb" : "white", 
                      color: activeDay === i + 1 ? "white" : "black", 
                      border: "1px solid #ccc" 
                    }}
                  >
                    Day {i + 1}
                  </button>
                ))}
              </div>

              <div style={{ background: "#0f172a", color: "white", padding: "15px", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}><FaHotel /> Day {activeDay} Hotel</h4>
                {currentHotel ? <p style={{ margin: 0 }}>{currentHotel.name}</p> : <p style={{ margin: 0, color: "gray" }}>No hotel selected for this day.</p>}
              </div>

              <div style={{ background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "black" }}>Day {activeDay} Route</h4>
                {optimizedLocations.length === 0 ? (
                  <p style={{ color: "gray", fontSize: "14px" }}>No activities added for this day.</p>
                ) : (
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "black" }}>
                    {optimizedLocations.map((loc, i) => (
                      <li key={i} style={{ marginBottom: "10px" }}>
                        <strong>Stop {i + 1}: {loc.name}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={{ flex: 2, height: "500px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)", zIndex: 0 }}>
              <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={mapCenter} />
                
                {currentHotel && (
                  <Marker position={[currentHotel.lat, currentHotel.lon]} icon={redIcon}>
                    <Popup><strong>Day {activeDay} Hotel:</strong> {currentHotel.name}</Popup>
                  </Marker>
                )}

                {optimizedLocations.map((loc, i) => (
                  <Marker key={i} position={[loc.lat, loc.lon]}>
                    <Popup><strong>Stop {i + 1}:</strong> {loc.name}</Popup>
                  </Marker>
                ))}

                {routeCoords.length > 1 && (
                  <Polyline positions={routeCoords} color="#2563eb" weight={4} dashArray="10, 10" />
                )}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const sectionStyle = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  overflow: "visible", 
};
const titleStyle = { margin: 0, padding: "15px 15px 0 15px", color: "black" };
const tabStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontWeight: "bold",
  whiteSpace: "nowrap"
};