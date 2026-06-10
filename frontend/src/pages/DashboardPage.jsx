import { FaSearch, FaBell } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getTrips } from "../services/tripService";
import { useNavigate } from "react-router-dom";
import { getImageForDestination } from "../services/pexelsService";

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [nextTripImage, setNextTripImage] = useState("");
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data?.trips || data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // STATS
  const totalTrips = trips.length;
  const upcomingTrips = trips.filter(
    (t) => new Date(t.startDate) > new Date()
  ).length;
  const totalBudget = trips.reduce(
    (sum, t) => sum + (Number(t.budget) || 0),
    0
  );

  // NEXT TRIP
  const nextTrip = [...trips]
    .filter((t) => new Date(t.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  // Fetch image for the next trip's destination
  useEffect(() => {
    const fetchNextTripImage = async () => {
      if (nextTrip?.destination) {
        setLoadingImage(true);
        setImageError(false);
        try {
          const imageUrl = await getImageForDestination(nextTrip.destination);
          setNextTripImage(imageUrl);
        } catch (err) {
          setImageError(true);
          setNextTripImage("");
        } finally {
          setLoadingImage(false);
        }
      } else {
        setNextTripImage("");
        setLoadingImage(false);
        setImageError(false);
      }
    };
    fetchNextTripImage();
  }, [nextTrip]);

  // RECENT
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h2>Smart Travel Planner</h2>
        <div style={{ display: "flex", gap: "15px" }}>
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            onClick={() => navigate("/profile")}
            style={{ width: 45, height: 45, borderRadius: "50%", cursor: "pointer", border: "2px solid #2563eb" }}
          />
        </div>
      </div>

      {/* GREETING */}
      <div>
        <h3>Welcome, {user?.username || "Explorer"}</h3>
        <p style={{ color: "gray" }}>
          Ready for your next adventure?
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
      }}>
        <StatCard title="Total Trips" value={totalTrips} />
        <StatCard title="Upcoming" value={upcomingTrips} />
        <StatCard title="Destinations" value={new Set(trips.map(t => t.destination)).size} />
      </div>

      {/* BUDGET */}
      <div style={{
        padding: "20px",
        background: "#002429",
        color: "white",
        borderRadius: "12px",
      }}>
        <h3>Total Budget</h3>
        <h1>RM {totalBudget}</h1>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* LEFT – Next Adventure (NO preset image) */}
        <div style={{ flex: 2 }}>
          <h3>Next Adventure</h3>
          {nextTrip ? (
            <div style={{
              position: "relative",
              height: "320px",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#e5e7eb"
            }}>
              {loadingImage ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  background: "#f3f4f6",
                  fontSize: "14px",
                  color: "#6b7280"
                }}>
                  Loading travel photo...
                </div>
              ) : imageError ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  background: "#f3f4f6",
                  fontSize: "14px",
                  color: "#dc2626"
                }}>
                  ❌ Could not load image
                </div>
              ) : (
                <img
                  src={nextTripImage}
                  alt={nextTrip.destination}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {/* Overlay (always visible) */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                color: "white",
              }}>
                <h2>{nextTrip.destination}</h2>
                <p>
                  {new Date(nextTrip.startDate).toLocaleDateString()} →
                  {new Date(nextTrip.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p>No upcoming trips</p>
          )}
        </div>

        {/* RIGHT – Recent Activity */}
        <div style={{ flex: 1 }}>
          <h3>Recent Activity</h3>
          {recentTrips.map((t) => (
            <div key={t._id} style={{
              background: "white",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}>
              <p style={{ fontWeight: "bold" }}>{t.destination}</p>
              <p style={{ fontSize: "12px", color: "gray" }}>
                Created: {new Date(t.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* StatCard Component */
function StatCard({ title, value }) {
  return (
    <div style={{
      padding: "20px",
      background: "#BFF8F8",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      border: "1px solid #e9eef3",
      textAlign: "left",
    }}>
      <p style={{ color: "#000000", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: "#000000" }}>{value}</h2>
    </div>
  );
}