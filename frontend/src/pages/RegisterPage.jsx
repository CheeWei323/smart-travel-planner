import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/auth.css";

import { registerUser } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await registerUser(userData);

      setMessage(response.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>

        <p className="auth-subtitle">
          Join Smart Travel Planner to organize your trips.
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
            <label>Username</label>

            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/"> Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;