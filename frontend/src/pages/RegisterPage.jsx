import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Notice } from "../components/UI";
import { registerUser } from "../services/authService";
import { errorMessage } from "../services/api";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_HINT,
  newPasswordError,
} from "../utils/passwordPolicy";
export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const policyError = newPasswordError(data.get("password"));
    if (policyError) {
      setError(policyError);
      return;
    }
    if (data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    try {
      await registerUser({
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password"),
      });
      navigate("/", {
        replace: true,
        state: { message: "Account created. Log in to start planning." },
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
        <PasswordInput
          label="Password"
          name="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          hint={PASSWORD_HINT}
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
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
