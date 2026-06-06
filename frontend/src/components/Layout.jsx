import { NavLink, Outlet } from "react-router-dom";
import {
  FaHome,
  FaSuitcase,
  FaMap,
  FaCog,
  FaQuestionCircle,
  FaPlus,
} from "react-icons/fa";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "1000vh" }}>
      
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
        <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
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

          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#1e293b" : "transparent",
            })}
          >
            <FaCog /> Settings
          </NavLink>

          <NavLink
            to="/support"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#1e293b" : "transparent",
            })}
          >
            <FaQuestionCircle /> Support
          </NavLink>
        </nav>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, padding: "20px" }}>
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