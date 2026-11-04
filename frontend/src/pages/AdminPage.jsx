import { useEffect, useState } from "react";
import {
  getStats, getUsers, updateUser, deleteUser,
  getAllTrips, deleteAnyTrip,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getAllFeedback, updateFeedback, deleteFeedback,
} from "../services/adminService";

const TABS = ["Overview", "Users", "Trips", "Announcements", "Feedback"];

export default function AdminPage() {
  const [tab, setTab] = useState("Overview");

  return (
    <div>
      <h2>Admin Panel</h2>
      <div style={{ display: "flex", gap: 8, margin: "15px 0 20px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background: tab === t ? "#2563eb" : "#e2e8f0",
              color: tab === t ? "white" : "#0f172a",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <Overview />}
      {tab === "Users" && <Users />}
      {tab === "Trips" && <Trips />}
      {tab === "Announcements" && <Announcements />}
      {tab === "Feedback" && <FeedbackAdmin />}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function Overview() {
  const [s, setS] = useState(null);

  useEffect(() => {
    getStats().then(setS).catch(console.error);
  }, []);

  if (!s) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 15 }}>
        <Stat label="Total Users" value={s.totalUsers} />
        <Stat label="New (7 days)" value={s.newUsers} />
        <Stat label="Suspended" value={s.suspendedUsers} />
        <Stat label="Total Trips" value={s.totalTrips} />
        <Stat label="Upcoming Trips" value={s.upcomingTrips} />
        <Stat label="Favorites Saved" value={s.totalFavorites} />
        <Stat label="Open Feedback" value={s.openFeedback} />
      </div>

      <div style={{ ...box, marginTop: 20, maxWidth: 420 }}>
        <h3 style={{ marginBottom: 10 }}>Top Destinations</h3>
        {s.topDestinations.length === 0 && <p style={{ color: "gray" }}>No trips yet.</p>}
        {s.topDestinations.map((d, i) => (
          <div key={d.destination} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>{i + 1}. {d.destination}</span>
            <strong>{d.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "#BFF8F8", padding: 18, borderRadius: 14 }}>
      <p style={{ fontSize: 13 }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: 30 }}>{value}</h2>
    </div>
  );
}

/* ---------------- USERS ---------------- */
function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const me = JSON.parse(localStorage.getItem("user") || "{}");

  const load = (query = q) => getUsers(query).then(setUsers).catch(console.error);

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = async (u, data) => {
    try {
      const updated = await updateUser(u._id, data);
      setUsers(users.map((x) => (x._id === u._id ? { ...x, ...updated } : x)));
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.email} and ALL their trips, checklists and favorites?`)) return;
    try {
      await deleteUser(u._id);
      setUsers(users.filter((x) => x._id !== u._id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={box}>
      <SearchBar value={q} onChange={setQ} onSearch={() => load()} placeholder="Search username or email" />
      <Table head={["Username", "Email", "Role", "Trips", "Joined", "Status", "Actions"]}>
        {users.map((u) => {
          const isMe = u._id === me.id;
          return (
            <tr key={u._id}>
              <td>{u.username}{isMe && " (you)"}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.tripCount}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td style={{ color: u.isActive === false ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                {u.isActive === false ? "Suspended" : "Active"}
              </td>
              <td>
                {!isMe && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Small onClick={() => change(u, { role: u.role === "admin" ? "user" : "admin" })}>
                      {u.role === "admin" ? "Make user" : "Make admin"}
                    </Small>
                    <Small onClick={() => change(u, { isActive: u.isActive === false })}>
                      {u.isActive === false ? "Reactivate" : "Suspend"}
                    </Small>
                    <Small danger onClick={() => remove(u)}>Delete</Small>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

/* ---------------- TRIPS ---------------- */
function Trips() {
  const [trips, setTrips] = useState([]);
  const [q, setQ] = useState("");

  const load = (query = q) => getAllTrips(query).then(setTrips).catch(console.error);

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (t) => {
    if (!window.confirm(`Delete trip to ${t.destination}?`)) return;
    try {
      await deleteAnyTrip(t._id);
      setTrips(trips.filter((x) => x._id !== t._id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={box}>
      <SearchBar value={q} onChange={setQ} onSearch={() => load()} placeholder="Search destination" />
      <Table head={["Destination", "User", "Dates", "Budget (RM)", "Actions"]}>
        {trips.map((t) => (
          <tr key={t._id}>
            <td>{t.destination}</td>
            <td>{t.userId?.username || "(deleted user)"}</td>
            <td>{new Date(t.startDate).toLocaleDateString()} → {new Date(t.endDate).toLocaleDateString()}</td>
            <td>{t.budget}</td>
            <td><Small danger onClick={() => remove(t)}>Delete</Small></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ---------------- ANNOUNCEMENTS ---------------- */
function Announcements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });

  useEffect(() => {
    getAnnouncements().then(setItems).catch(console.error);
  }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      const created = await createAnnouncement(form);
      setItems([created, ...items]);
      setForm({ title: "", message: "", type: "info" });
    } catch (err) {
      alert(err.response?.data?.message || "Could not create");
    }
  };

  const toggle = async (a) => {
    const updated = await updateAnnouncement(a._id, { isActive: !a.isActive });
    setItems(items.map((x) => (x._id === a._id ? updated : x)));
  };

  const remove = async (a) => {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteAnnouncement(a._id);
    setItems(items.filter((x) => x._id !== a._id));
  };

  return (
    <div>
      <form onSubmit={add} style={{ ...box, display: "flex", flexDirection: "column", gap: 10, maxWidth: 600 }}>
        <h3>New Announcement</h3>
        <input
          placeholder="Title" required style={input}
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Message shown to all users on their dashboard" required rows={3} style={input}
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <select style={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
        </select>
        <button type="submit" style={btn}>Publish</button>
      </form>

      <div style={{ ...box, marginTop: 20 }}>
        <Table head={["Title", "Message", "Type", "Visible", "Actions"]}>
          {items.map((a) => (
            <tr key={a._id}>
              <td>{a.title}</td>
              <td>{a.message}</td>
              <td>{a.type}</td>
              <td>{a.isActive ? "Yes" : "Hidden"}</td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <Small onClick={() => toggle(a)}>{a.isActive ? "Hide" : "Show"}</Small>
                  <Small danger onClick={() => remove(a)}>Delete</Small>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}

/* ---------------- FEEDBACK ---------------- */
function FeedbackAdmin() {
  const [items, setItems] = useState([]);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    getAllFeedback().then(setItems).catch(console.error);
  }, []);

  const save = async (f, status) => {
    const reply = replies[f._id] ?? f.adminReply;
    try {
      const updated = await updateFeedback(f._id, { status: status || f.status, adminReply: reply });
      setItems(items.map((x) => (x._id === f._id ? updated : x)));
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const remove = async (f) => {
    if (!window.confirm("Delete this feedback?")) return;
    await deleteFeedback(f._id);
    setItems(items.filter((x) => x._id !== f._id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.length === 0 && <p style={{ color: "gray" }}>No feedback yet.</p>}
      {items.map((f) => (
        <div key={f._id} style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <strong>[{f.category}] {f.subject}</strong>
            <span style={{ fontSize: 13, color: "gray" }}>
              {f.userId?.username || "(deleted user)"} · {new Date(f.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p style={{ margin: "8px 0", fontSize: 14 }}>{f.message}</p>
          <textarea
            rows={2} placeholder="Write a reply (visible to the user)" style={input}
            defaultValue={f.adminReply}
            onChange={(e) => setReplies({ ...replies, [f._id]: e.target.value })}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13 }}>Status: <strong>{f.status}</strong></span>
            <Small onClick={() => save(f, "reviewed")}>Mark reviewed</Small>
            <Small onClick={() => save(f, "resolved")}>Mark resolved</Small>
            <Small onClick={() => save(f)}>Save reply</Small>
            <Small danger onClick={() => remove(f)}>Delete</Small>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- shared bits ---------------- */
function SearchBar({ value, onChange, onSearch, placeholder }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input
        value={value} placeholder={placeholder} style={{ ...input, maxWidth: 320 }}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button style={btn} onClick={onSearch}>Search</button>
    </div>
  );
}

function Table({ head, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      <style>{`td { padding: 10px 8px; border-top: 1px solid #e5e7eb; vertical-align: top; }`}</style>
    </div>
  );
}

function Small({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
        background: danger ? "#fee2e2" : "#e2e8f0", color: danger ? "#b91c1c" : "#0f172a",
      }}
    >
      {children}
    </button>
  );
}

const box = { background: "white", padding: 20, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" };
const th = { textAlign: "left", padding: "8px", fontSize: 13, color: "#475569" };
const input = {
  width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db",
  fontSize: 14, boxSizing: "border-box", fontFamily: "inherit",
};
const btn = {
  padding: "10px 18px", background: "#2563eb", color: "white", border: "none",
  borderRadius: 8, fontWeight: "bold", cursor: "pointer",
};
