import { Link, NavLink, Outlet } from "react-router-dom";
import {
  FaCompass,
  FaHome,
  FaSuitcase,
  FaMap,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaCommentAlt,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();
  const links = [
    ["/dashboard", FaHome, "Dashboard"],
    ["/trips", FaSuitcase, "My trips"],
    ["/itinerary", FaMap, "Itinerary"],
    ["/feedback", FaCommentAlt, "Help & feedback"],
    ["/profile", FaUser, "Account settings"],
  ];
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">
          <span className="brand-icon">
            <FaCompass />
          </span>
          <span>
            TravelWise<small>MAKE ROOM FOR ADVENTURE</small>
          </span>
        </Link>
        <Link className="button create-trip" to="/create-trip">
          <FaPlus />
          Create a trip
        </Link>
        <nav aria-label="Main navigation">
          {links.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="account-chip">
            <span className="avatar">
              {user.username.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{user.username}</strong>
              <small>Your next adventure awaits</small>
            </span>
          </div>
          <button className="nav-link logout" onClick={logout}>
            <FaSignOutAlt />
            Log out
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>Your plans. Your pace.</span>
          <div className="actions">
            <Link to="/profile" className="profile-link">
              <span className="avatar small">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              {user.username}
            </Link>
            <button
              className="icon-button"
              aria-label="Log out"
              title="Log out"
              onClick={logout}
            >
              <FaSignOutAlt />
            </button>
          </div>
        </header>
        <main id="main-content">
          <Outlet />
        </main>
        <footer>TravelWise · A little planning. A lot of possibility.</footer>
      </div>
    </div>
  );
}
