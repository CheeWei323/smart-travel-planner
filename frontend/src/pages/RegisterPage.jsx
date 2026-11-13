import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

import AuthLayout from "../components/AuthLayout";
import { Notice } from "../components/UI";
import { registerUser } from "../services/authService";
import { errorMessage } from "../services/api";

const getPasswordStrength = (password) => {
  if (!password) return null;

  const result = zxcvbn(password);

  const labels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Strong",
  ];

  return {
    score: result.score,
    label: labels[result.score],
  };
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");

  const strength = getPasswordStrength(password);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);

    if (data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }

    if (data.get("privacyConsent") !== "on") {
      setError("You must agree to the Privacy Policy.");
      return;
    }

    setPending(true);

    try {
      await registerUser({
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password"),
        privacyConsent: true,
      });

      navigate("/", {
        replace: true,
        state: {
          message: "Account created. Log in to start planning.",
        },
      });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Adventure starts here."
      subtitle="Create your account and make your first plan."
    >
      <Notice>{error}</Notice>

      <form className="form-stack" onSubmit={submit}>
        <label>
          Your name
          <input
            name="username"
            required
            maxLength={80}
            autoComplete="nickname"
            placeholder="How should we call you?"
          />
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <small>At least 6 characters; up to 72 bytes.</small>

          {strength && (
            <div className="password-strength">
              <div className="password-strength-header">
                <small>Password strength</small>
                <small className={`strength-text strength-${strength.score}`}>
                  {strength.label}
                </small>
              </div>

              <div className="strength-bar">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={
                      index < Math.max(1, strength.score)
                        ? `strength-fill strength-${strength.score}`
                        : ""
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </label>

        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <div className="consent-row">
          <input
            id="privacyConsent"
            type="checkbox"
            name="privacyConsent"
            required
          />

          <label htmlFor="privacyConsent">
            I agree to the{" "}
            <Link
              to="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <button className="button full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/">Log in</Link>
      </p>
    </AuthLayout>
  );
}