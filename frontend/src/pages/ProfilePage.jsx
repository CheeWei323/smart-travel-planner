import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProfilePage() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [newEmail, setNewEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

const handleUpdateEmail = async () => {
  try {

    const token = localStorage.getItem("token");

    const response = await axios.put(
      "http://localhost:5000/api/auth/profile",
      {
        email: newEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    alert("Email updated successfully");

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Update failed"
    );
  }
};

const handleUpdatePassword = async () => {
  try {

    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/api/auth/profile",
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Password updated successfully");

    setCurrentPassword("");
    setNewPassword("");

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Password update failed"
    );
  }
};

  return (
  <div
    style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "40px",
      fontFamily: "Arial",
    }}
  >
    {/* TOP */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      <h1 style={{ color: "#0f172a" }}>
        Account Settings
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "10px 18px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ← Dashboard
      </button>
    </div>

    {/* MAIN CONTENT */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        gap: "30px",
      }}
    >
      {/* LEFT PROFILE CARD */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          height: "fit-content",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src="https://i.pravatar.cc/120"
            alt="Profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              marginBottom: "20px",
              border: "4px solid #2563eb",
            }}
          />

          <h2>{user?.username}</h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "25px",
            }}
          >
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* RIGHT SETTINGS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        {/* CHANGE EMAIL */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Change Email
          </h2>

          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          />

          <button
          onClick={handleUpdateEmail}
            style={{
              padding: "12px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Update Email
          </button>
        </div>

        {/* CHANGE PASSWORD */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Change Password
          </h2>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          />

          <button
          onClick={handleUpdatePassword}
            style={{
              padding: "12px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

export default ProfilePage;