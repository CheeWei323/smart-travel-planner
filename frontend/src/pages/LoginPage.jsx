import { loginDestination } from "../utils/portalAccess";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Notice } from "../components/UI";
import { errorMessage } from "../services/api";
export default function LoginPage() {
  const { login, sessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const user = await login({
        email: data.get("email"),
        password: data.get("password"),
      });
      navigate(loginDestination(user.role, location.state?.from), {
        replace: true,
      });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Log in and pick up where your plans left off."
    >
      <Notice type="success">{location.state?.message}</Notice>
      <Notice>{error || sessionMessage}</Notice>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          required
        />
        <button className="button full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="auth-switch">
        New to TravelWise? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
