import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSuitcase,
  FaMap,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          background: "#0f172a",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <h2 
          onClick={() => navigate("/dashboard")}
          style={{ 
            fontSize: "22px", 
            marginBottom: "20px", 
            cursor: "pointer", 
            userSelect: "none" 
          }}
        >
          TravelWise
        </h2>

        {/* Create Trip Button */}
        <NavLink
          to="/create-trip"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: "600",
            marginBottom: "25px",
          }}
        >
          <FaPlus />
          Create Trip
        </NavLink>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#1e293b" : "transparent",
            })}
          >
            <FaHome /> Dashboard
          </NavLink>

          <NavLink
            to="/trips"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#1e293b" : "transparent",
            })}
          >
            <FaSuitcase /> Trips
          </NavLink>

          <NavLink
            to="/itinerary"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#1e293b" : "transparent",
            })}
          >
            <FaMap /> Itinerary
          </NavLink>

        </nav>

        {/* Logout Button pushed to the bottom */}
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              ...linkStyle,
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#ef4444", 
              fontSize: "15px",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

/* shared style */
const linkStyle = {
  color: "white",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "15px",
  padding: "10px",
  borderRadius: "8px",
};