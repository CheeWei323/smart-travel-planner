import { FaSearch, FaPlus, FaSuitcase, FaHistory, FaHeart, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { getTrips, deleteTrip } from "../services/tripService";
import { getFavorites, addFavorite, deleteFavorite } from "../services/favoriteService";
import { getImageForDestination } from "../services/pexelsService";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("active");

  const navigate = useNavigate();

  // --- Favorites State ---
  const [favorites, setFavorites] = useState([]);
  const [newFavorite, setNewFavorite] = useState("");
  
  // Photon API State for Favorites
  const [favSearchResults, setFavSearchResults] = useState([]);
  const [showFavDropdown, setShowFavDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, favsData] = await Promise.all([getTrips(), getFavorites()]);
      setTrips(tripsData?.trips || tripsData || []);
      setFavorites(favsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- PHOTON API SEARCH FOR FAVORITES ---
  const handleFavSearch = async (e) => {
    const query = e.target.value;
    setNewFavorite(query);

    if (query.length < 3) {
      setFavSearchResults([]);
      setShowFavDropdown(false);
      return;
    }

    try {
      const res = await axios.get(`https://photon.komoot.io/api/?q=${query}&limit=5`);
      const results = res.data.features.map((f) => ({
        name: f.properties.name,
        country: f.properties.country || "",
        state: f.properties.state || ""
      }));
      setFavSearchResults(results.filter(r => r.name));
      setShowFavDropdown(true);
    } catch (err) {
      console.error("Photon API error:", err);
    }
  };

  const handleSelectFavorite = (dest) => {
    const finalDest = dest.country && dest.name !== dest.country 
      ? `${dest.name}, ${dest.country}` 
      : dest.name;
      
    setNewFavorite(finalDest);
    setFavSearchResults([]);
    setShowFavDropdown(false);
  };

  // --- FAVORITES API HANDLERS ---
  const handleAddFavorite = async (e) => {
    e.preventDefault();
    if (!newFavorite.trim()) return;
    try {
      const added = await addFavorite(newFavorite);
      setFavorites([...favorites, added]);
      setNewFavorite("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add favorite");
    }
  };

  const handleDeleteFavorite = async (id) => {
    try {
      await deleteFavorite(id);
      setFavorites(favorites.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Filtering & Sorting Logic ---
  const searchedTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const today = new Date();
  
  const activeUpcomingTrips = searchedTrips
    .filter((t) => new Date(t.endDate) >= today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const pastTrips = searchedTrips
    .filter((t) => new Date(t.endDate) < today)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const displayedTrips = viewMode === "active" ? activeUpcomingTrips : pastTrips;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Trips</h2>
        <button
          onClick={() => navigate("/create-trip")}
          style={{ padding: "10px 15px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
        >
          <FaPlus /> Add Trip
        </button>
      </div>

      {/* FAVORITES SECTION */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "visible" }}>
        <h3 style={{ margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "8px", color: "#e11d48" }}>
          <FaHeart /> Favorite Destinations
        </h3>
        
        <form onSubmit={handleAddFavorite} style={{ display: "flex", gap: "10px", marginBottom: "15px", position: "relative" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input 
              value={newFavorite}
              onChange={handleFavSearch}
              placeholder="Search for a real country or city..."
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
              autoComplete="off"
            />
            
            {showFavDropdown && favSearchResults.length > 0 && (
              <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", zIndex: 1000, listStyle: "none", margin: 0, padding: 0, border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto" }}>
                {favSearchResults.map((res, i) => (
                  <li 
                    key={i} 
                    onClick={() => handleSelectFavorite(res)}
                    style={{ padding: "12px", borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", flexDirection: "column" }}
                    onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                    onMouseLeave={(e) => e.target.style.background = "white"}
                  >
                    <strong style={{ color: "#111827" }}>{res.name}</strong> 
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {res.state ? `${res.state}, ` : ""}{res.country}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" style={{ padding: "10px 15px", background: "#e11d48", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Add</button>
        </form>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {favorites.length === 0 ? <p style={{ color: "gray", margin: 0, fontSize: "14px" }}>No favorites yet. Add some!</p> : null}
          {favorites.map(fav => (
            <div key={fav._id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef1f2", color: "#be123c", padding: "8px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", transition: "transform 0.2s" }}>
              
              {/* Clickable text that navigates to Create Trip */}
              <span 
                style={{ cursor: "pointer" }} 
                title={`Create trip to ${fav.destination}`}
                onClick={() => navigate('/create-trip', { state: { destination: fav.destination } })}
              >
                {fav.destination}
              </span>
              
              <FaTrash 
                onClick={(e) => { e.stopPropagation(); handleDeleteFavorite(fav._id); }} 
                style={{ cursor: "pointer", opacity: 0.7, marginLeft: "4px" }} 
                title="Remove favorite"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS (Tabs & Search) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", background: "#e5e7eb", padding: "4px", borderRadius: "10px" }}>
          <button onClick={() => setViewMode("active")} style={{ ...tabBtnStyle, background: viewMode === "active" ? "white" : "transparent", color: viewMode === "active" ? "#2563eb" : "#6b7280", boxShadow: viewMode === "active" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}>
            <FaSuitcase /> Active & Upcoming
          </button>
          <button onClick={() => setViewMode("history")} style={{ ...tabBtnStyle, background: viewMode === "history" ? "white" : "transparent", color: viewMode === "history" ? "#2563eb" : "#6b7280", boxShadow: viewMode === "history" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}>
            <FaHistory /> History
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#ffffff", padding: "10px 16px", borderRadius: "10px", width: "300px", border: "1px solid #e5e7eb" }}>
          <FaSearch color="#6b7280" />
          <input placeholder="Search trips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: "none", outline: "none", width: "100%", background: "transparent", fontSize: "14px" }} />
        </div>
      </div>

      {/* TRIP LIST */}
      {loading ? (
        <p>Loading trips...</p>
      ) : displayedTrips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", border: "1px dashed #ccc" }}>
          <p style={{ color: "gray", fontSize: "16px" }}>No trips found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {displayedTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} onDelete={handleDelete} onEdit={() => navigate(`/edit-trip/${trip._id}`)} onView={() => navigate(`/view-trip/${trip._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

const tabBtnStyle = { padding: "8px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease" };

// ---------- TripCard Component ----------
function TripCard({ trip, onDelete, onEdit, onView }) {
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const loadImage = async () => { setImageUrl(await getImageForDestination(trip.destination)); };
    loadImage();
  }, [trip.destination]);

  const getStatus = () => {
    const today = new Date(), start = new Date(trip.startDate), end = new Date(trip.endDate);
    if (start > today) return "Upcoming";
    if (start <= today && end >= today) return "Active";
    return "Completed";
  };
  const status = getStatus();
  const statusColor = { Upcoming: "#3b82f6", Active: "#22c55e", Completed: "#6b7280" }[status];

  return (
    <div style={{ background: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ position: "relative", height: "180px", background: "#e5e7eb" }}>
        {imageUrl && <img src={imageUrl} alt={trip.destination} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <span style={{ position: "absolute", top: "10px", left: "10px", background: statusColor, color: "white", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold", zIndex: 2 }}>{status}</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", color: "white", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", zIndex: 2 }}>
          <h3 style={{ margin: 0 }}>{trip.destination}</h3>
        </div>
      </div>
      <div style={{ padding: "15px" }}>
        <p style={{ margin: "0 0 5px 0", color: "#4b5563" }}>
          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} {" → "} {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
        </p>
        <p style={{ margin: "0 0 15px 0", fontWeight: "bold" }}>RM {trip.budget}</p>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "15px" }}>
          <span onClick={onView} style={{ color: "green", cursor: "pointer", fontWeight: "bold" }}>👁 View</span>
          <span onClick={onEdit} style={{ color: "blue", cursor: "pointer", fontWeight: "bold" }}>✏ Edit</span>
          <span onClick={() => onDelete(trip._id)} style={{ color: "red", cursor: "pointer", fontWeight: "bold" }}>🗑 Delete</span>
        </div>
      </div>
    </div>
  );
}