import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: "white", marginBottom: "25px", fontSize: "28px" }}>Welcome to TravelWise!</h2>
        
        {/* The Pill-Shaped Toggle (Login Active) */}
        <div style={toggleContainer}>
          <button style={toggleButtonInactive} onClick={() => navigate("/register")}>SIGN UP</button>
          <button style={toggleButtonActive}>LOG IN</button>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "15px" }}>{error}</p>
        )}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input 
            type="email" placeholder="Email (Login)" required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input 
            type="password" placeholder="Enter password" required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Log In</button>
        </form>
      </div>
    </div>
  );
}

// --- STYLES & ANIMATION ---
const pageStyle = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
};

// 🔥 FIX: Injecting body margin reset alongside the animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
if (!document.head.innerHTML.includes("@keyframes gradient")) {
  document.head.appendChild(styleSheet);
}

const cardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "40px",
  borderRadius: "20px",
  width: "350px",
  textAlign: "center",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};

// Toggle Styles
const toggleContainer = {
  display: "flex",
  background: "rgba(0, 0, 0, 0.4)",
  borderRadius: "12px",
  padding: "4px",
  marginBottom: "25px",
};

const toggleButtonActive = {
  flex: 1,
  padding: "12px",
  background: "rgba(255, 255, 255, 0.15)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "14px",
  letterSpacing: "1px",
  cursor: "default",
};

const toggleButtonInactive = {
  flex: 1,
  padding: "12px",
  background: "transparent",
  color: "#9ca3af",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "14px",
  letterSpacing: "1px",
  cursor: "pointer",
  transition: "color 0.2s",
};

const inputStyle = {
  width: "100%",
  padding: "14px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  background: "rgba(0, 0, 0, 0.2)",
  color: "white",
  boxSizing: "border-box",
  outline: "none",
  fontSize: "14px"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
  transition: "background 0.2s ease",
};