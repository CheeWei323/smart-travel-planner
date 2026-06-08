import { FaSearch, FaBell } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getTrips } from "../services/tripService";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);

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

  // 🔥 STATS
  const totalTrips = trips.length;

  const upcomingTrips = trips.filter(
    (t) => new Date(t.startDate) > new Date()
  ).length;

  const totalBudget = trips.reduce(
    (sum, t) => sum + (Number(t.budget) || 0),
    0
  );

  // 🔥 NEXT TRIP
  const nextTrip = [...trips]
    .filter((t) => new Date(t.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  // 🔥 RECENT
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

        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#ffffff",
            padding: "12px 16px",
            borderRadius: "12px",
            width: "350px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <FaSearch color="gray" />
          <input placeholder="Search destinations..." style={{
            border: "none",
            outline: "none",
            width: "100%",
            background: "transparent",
            fontSize: "14px",
            color: "#111827"
          }} />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <FaBell size={18} />
          <img
            src="https://i.pravatar.cc/40"
            alt= "Profile"
            onClick={() => navigate("/profile")}
            style={{ width: 40, height: 40, borderRadius: "50%", cursor: "pointer", border: "2px solid #2563eb" }}
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

      {/* STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "15px",
      }}>
        <StatCard title="Total Trips" value={totalTrips} />
        <StatCard title="Upcoming" value={upcomingTrips} />
        <StatCard title="Destinations" value={new Set(trips.map(t => t.destination)).size} />
      </div>

      {/* BUDGET */}
      <div style={{
        padding: "20px",
        background: "#0f172a",
        color: "white",
        borderRadius: "12px",
      }}>
        <h3>Total Budget</h3>
        <h1>RM {totalBudget}</h1>
      </div>

      {/* BOTTOM */}
      <div style={{ display: "flex", gap: "20px" }}>

        {/* LEFT */}
        <div style={{ flex: 2 }}>

          <h3>Next Adventure</h3>

          {nextTrip ? (
            <div style={{
              position: "relative",
              height: "320px",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <img
                src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

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

        {/* RIGHT */}
        <div style={{ flex: 1 }}>

          <h3>Recent Activity</h3>

          {recentTrips.map((t) => (
            <div key={t._id} style={{
              background: "white",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "10px",
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

/* CARD */
function StatCard({ title, value }) {
  return (
    <div style={{
      padding: "15px",
      background: "white",
      borderRadius: "10px",
    }}>
      <p style={{ color: "gray" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}