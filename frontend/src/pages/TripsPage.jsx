import { FaSearch, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTrips,
  deleteTrip,
} from "../services/tripService";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);

      const data = await getTrips();
      setTrips(data?.trips || data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this trip?");
    if (!ok) return;

    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>My Trips</h2>

        <button
          onClick={() => navigate("/create-trip")}
          style={{
            padding: "10px 15px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <FaPlus /> Add Trip
        </button>
      </div>

      {/* SEARCH */}
      <div style={{
        display: "flex",
        gap: "10px",
        background: "#f1f5f9",
        padding: "10px",
        borderRadius: "10px",
        width: "350px"
      }}>
        <FaSearch color="gray" />
        <input placeholder="Search trips..." style={{
          border: "none",
          outline: "none",
          width: "100%",
          background: "transparent"
        }} />
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : trips.length === 0 ? (
        <p>No trips found</p>
      ) : (
        trips.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onDelete={handleDelete}
            onEdit={() => navigate(`/edit-trip/${trip._id}`)}
            onView={() => navigate(`/view-trip/${trip._id}`)}
          />
        ))
      )}
    </div>
  );
}

function TripCard({ trip, onEdit, onDelete, onView }) {

  const getStatus = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (start > today) return "Upcoming";
    if (start <= today && end >= today) return "Active";
    if (end < today) return "Completed";
    return "Unknown";
  };

  const status = getStatus();

  const statusColor = {
    Upcoming: "#3b82f6",
    Active: "#22c55e",
    Completed: "#6b7280",
    Unknown: "#f59e0b",
  }[status];

  return (
    <div style={{
      background: "white",
      borderRadius: "15px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}>

      {/* IMAGE */}
      <div style={{ position: "relative", height: "180px" }}>
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* ✅ STATUS TOP LEFT BADGE */}
        <span
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: statusColor,
            color: "white",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>

        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px",
          color: "white",
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
        }}>
          <h3>{trip.destination}</h3>
        </div>
      </div>

      {/* INFO */}
      <div style={{ padding: "15px" }}>
        <p>
          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"}
          {" → "}
          {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
        </p>

        <p>RM {trip.budget}</p>

        {/* ACTIONS */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span onClick={onView} style={{ color: "green", cursor: "pointer" }}>👁 View</span>
          <span onClick={onEdit} style={{ color: "blue", cursor: "pointer" }}>✏ Edit</span>
          <span onClick={() => onDelete(trip._id)} style={{ color: "red", cursor: "pointer" }}>🗑 Delete</span>
        </div>
      </div>
    </div>
  );
}