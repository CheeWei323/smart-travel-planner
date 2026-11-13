
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

import { useAuth } from "../hooks/useAuth";
import {
  updateProfile,
  deleteAccount,
  exportUserData,
} from "../services/authService";
import { errorMessage } from "../services/api";
import { ConfirmAction, Notice, PageTitle } from "../components/UI";

const getPasswordStrength = (password) => {
  if (!password) return null;

  const result = zxcvbn(password);

  const labels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ];

  return {
    score: result.score,
    label: labels[result.score],
  };
};

export default function ProfilePage({ admin = false }) {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileResult, setProfileResult] = useState(null);
  const [passwordResult, setPasswordResult] = useState(null);
  const [pending, setPending] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [exportPending, setExportPending] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const strength = getPasswordStrength(newPassword);

  const profile = async (event) => {
    event.preventDefault();

    const values = new FormData(event.currentTarget);

    setPending("profile");
    setProfileResult(null);

    try {
      const data = await updateProfile({
        username: values.get("username"),
        email: values.get("email"),
      });

      updateUser(data.user);

      setProfileResult({
        type: "success",
        message: "Your profile is up to date.",
      });
    } catch (failure) {
      setProfileResult({
        type: "error",
        message: errorMessage(failure),
      });
    } finally {
      setPending("");
    }
  };

  const password = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const values = new FormData(form);

    setPasswordResult(null);

    if (values.get("newPassword") !== values.get("confirmPassword")) {
      setPasswordResult({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    setPending("password");

    try {
      await updateProfile({
        currentPassword: values.get("currentPassword"),
        newPassword: values.get("newPassword"),
      });

      form.reset();
      setNewPassword("");

      setPasswordResult({
        type: "success",
        message: "Your password has been updated.",
      });
    } catch (failure) {
      setPasswordResult({
        type: "error",
        message: errorMessage(failure),
      });
    } finally {
      setPending("");
    }
  };

  const remove = async () => {
    await deleteAccount(deletePassword);
    logout();

    navigate("/", {
      replace: true,
      state: {
        message: "Your account and travel data have been deleted.",
      },
    });
  };

  const downloadData = async () => {
    setExportPending(true);
    setExportResult(null);

    try {
      const data = await exportUserData();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "my-travelwise-data.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setExportResult({
        type: "success",
        message: "Your data has been downloaded successfully.",
      });
    } catch (failure) {
      setExportResult({
        type: "error",
        message: errorMessage(failure),
      });
    } finally {
      setExportPending(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow={admin ? "ADMIN PORTAL" : "TRAVELWISE"}
        title={admin ? "Administrator settings" : "A space for your details."}
      >
        Manage your profile, password and account.
      </PageTitle>

      <div className="profile-grid">
        <aside className="panel profile-summary">
          <span className="avatar large">
            {user.username.slice(0, 1).toUpperCase()}
          </span>
          <h2>{user.username}</h2>
          <p className="muted">{user.email}</p>
          <span className="badge">
            {user.role === "admin" ? "Administrator" : "TravelWise explorer"}
          </span>
        </aside>

        <div className="form-stack">
          <form className="panel form-stack" onSubmit={profile}>
            <section className="panel form-stack">
              <h2>Your personal data</h2>

              <p className="muted">
                Download a copy of your profile information,
                travel plans, itineraries and feedback.
              </p>

              <Notice type={exportResult?.type}>
                {exportResult?.message}
              </Notice>

              <button
                type="button"
                className="button secondary"
                onClick={downloadData}
                disabled={exportPending || Boolean(pending)}
              >
                {exportPending ? "Preparing download..." : "Download my data"}
              </button>
            </section>

            <h2>Personal details</h2>

            <Notice type={profileResult?.type}>
              {profileResult?.message}
            </Notice>

            <label>
              Your name
              <input
                name="username"
                defaultValue={user.username}
                required
                maxLength={80}
                autoComplete="nickname"
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                maxLength={254}
                autoComplete="email"
              />
            </label>

            <button className="button" disabled={Boolean(pending)}>
              {pending === "profile" ? "Saving…" : "Save profile"}
            </button>
          </form>

          <form className="panel form-stack" onSubmit={password}>
            <h2>Change password</h2>

            <Notice type={passwordResult?.type}>
              {passwordResult?.message}
            </Notice>

            <label>
              Current password
              <input
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>

            <div className="form-grid">
              <label>
                New password
                <input
                  name="newPassword"
                  type="password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />

                {strength && (
                  <div className="password-strength">
                    <div className="password-strength-header">
                      <small>Password strength</small>
                      <small className={`strength-text strength-${strength.score}`}>
                        {strength.label}
                      </small>
                    </div>

                    <div className="strength-bar">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <span
                          key={index}
                          className={
                            index <= strength.score
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
                Confirm new password
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </label>
            </div>

            <button
              className="button secondary"
              disabled={Boolean(pending)}
            >
              {pending === "password" ? "Updating…" : "Update password"}
            </button>
          </form>

          {!admin && (
            <section className="panel danger-panel form-stack">
              <h2>Delete account</h2>

              <p className="muted">
                This permanently removes your account, trips, itineraries,
                checklists, favorites and feedback. This cannot be undone.
              </p>

              <label>
                Confirm your password
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <ConfirmAction
                label="Delete my account"
                title="Permanently delete your account?"
                disabled={!deletePassword || Boolean(pending)}
                onConfirm={remove}
              >
                All of your travel plans and associated data will be removed.
              </ConfirmAction>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
