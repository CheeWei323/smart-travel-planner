import { Link, NavLink, Outlet } from "react-router-dom";
import {
  FaCompass,
  FaTachometerAlt,
  FaUsers,
  FaSuitcase,
  FaBullhorn,
  FaComments,
  FaCog,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const links = [
  ["/admin", FaTachometerAlt, "Dashboard"],
  ["/admin/users", FaUsers, "Users"],
  ["/admin/trips", FaSuitcase, "Trip management"],
  ["/admin/announcements", FaBullhorn, "Announcements"],
  ["/admin/feedback", FaComments, "Feedback"],
  ["/admin/security", FaShieldAlt, "Security logs"],
  ["/admin/settings", FaCog, "Account settings"],
];
export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-layout admin-portal">
      <aside className="sidebar">
        <Link className="brand" to="/admin">
          <span className="brand-icon">
            <FaCompass />
          </span>
          <span>
            TravelWise<small>ADMIN PORTAL</small>
          </span>
        </Link>
        <p className="portal-nav-label eyebrow">ADMINISTRATION</p>
        <nav aria-label="Admin navigation">
          {links.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
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
              <small>Administrator</small>
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
          <span>TravelWise administration</span>
          <div className="actions">
            <Link to="/admin/settings" className="profile-link">
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
        <footer>TravelWise · Admin portal</footer>
      </div>
    </div>
  );
}
