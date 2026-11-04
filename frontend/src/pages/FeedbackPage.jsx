import { useEffect, useState } from "react";
import { submitFeedback, getMyFeedback } from "../services/feedbackService";

const statusColor = { open: "#f59e0b", reviewed: "#3b82f6", resolved: "#16a34a" };

export default function FeedbackPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "suggestion", subject: "", message: "" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setItems(await getMyFeedback());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getMyFeedback().then(setItems).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback(form);
      setForm({ category: "suggestion", subject: "", message: "" });
      setMsg("Thanks! Your feedback was sent.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not send feedback");
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Help & Feedback</h2>
      <p style={{ color: "gray", marginBottom: 20 }}>Report a bug or suggest an improvement.</p>

      <form onSubmit={handleSubmit} style={card}>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ ...input, flex: "0 0 150px" }}
          >
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug report</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Subject"
            required
            maxLength={120}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            style={input}
          />
        </div>
        <textarea
          placeholder="Tell us more..."
          required
          rows={4}
          maxLength={2000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ ...input, resize: "vertical" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="submit" style={btn}>Send</button>
          {msg && <span style={{ fontSize: 14, color: "#475569" }}>{msg}</span>}
        </div>
      </form>

      <h3 style={{ margin: "25px 0 10px" }}>My Feedback</h3>
      {items.length === 0 && <p style={{ color: "gray" }}>Nothing submitted yet.</p>}
      {items.map((f) => (
        <div key={f._id} style={{ ...card, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{f.subject}</strong>
            <span style={{ color: statusColor[f.status], fontWeight: 600, fontSize: 13 }}>
              {f.status.toUpperCase()}
            </span>
          </div>
          <p style={{ color: "#475569", fontSize: 14 }}>{f.message}</p>
          {f.adminReply && (
            <div style={{ background: "#eff6ff", padding: 10, borderRadius: 8, fontSize: 14 }}>
              <strong>Admin reply:</strong> {f.adminReply}
            </div>
          )}
          <small style={{ color: "gray" }}>{new Date(f.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const btn = {
  padding: "10px 22px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
};
