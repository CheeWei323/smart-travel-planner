import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/auth.css";

import { loginUser } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(formData);

      // Save JWT token
      localStorage.setItem("token", response.token);

      // Save user data
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setMessage("Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          Smart Travel Planner
        </h1>

        <p className="auth-subtitle">
          Sign in to manage your trips and itineraries.
        </p>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="abc@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
          >
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?
          <Link to="/register"> Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;