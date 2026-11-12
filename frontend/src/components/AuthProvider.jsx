import { useEffect, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import api, { errorMessage } from "../services/api";
import { acceptSession, endStoredSession, getSessionId, getSessionRevision,
  startSessionExpiry, withSessionLock, SESSION_EVENT_KEY } from "../utils/session";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionMessage, setSessionMessage] = useState("");
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    let active = true;
    const updated = (event) => {
      setUser(event.detail);
      setSessionId(getSessionId());
      setLoading(false);
      setSessionMessage("");
      setLogoutError("");
    };
    const ended = (event) => {
      setUser(null);
      setSessionId(null);
      setLoading(false);
      setSessionMessage(event.detail);
      setLogoutError("");
    };
    const restore = () => withSessionLock(async () => {
      if (!active) return;
      const started = getSessionRevision();
      try {
        const { data } = await api.get("/auth/me");
        if (active && getSessionRevision() === started) acceptSession(data);
      } catch (failure) {
        if (active && getSessionRevision() === started)
          endStoredSession(failure.response?.status === 401 ? "" : errorMessage(failure));
      } finally {
        if (active) setLoading(false);
      }
    });
    const changedInAnotherTab = (event) => {
      if (event.key !== SESSION_EVENT_KEY && event.key !== null) return;
      setUser(null);
      setLoading(true);
      void restore();
    };
    window.addEventListener("travelwise:session-updated", updated);
    window.addEventListener("travelwise:session-ended", ended);
    window.addEventListener("storage", changedInAnotherTab);
    const stopExpiry = startSessionExpiry();
    void restore();
    return () => {
      active = false;
      stopExpiry();
      window.removeEventListener("travelwise:session-updated", updated);
      window.removeEventListener("travelwise:session-ended", ended);
      window.removeEventListener("storage", changedInAnotherTab);
    };
  }, []);
  const login = (credentials) => withSessionLock(async () => {
    const { data } = await api.post("/auth/login", credentials);
    acceptSession(data, true);
    return data.user;
  });
  const logout = async () => {
    if (logoutPending) return false;
    const expected = getSessionId();
    setLogoutPending(true);
    setLogoutError("");
    try {
      return await withSessionLock(async () => {
        if (getSessionId() !== expected) return false;
        await api.post("/auth/logout", {});
        return endStoredSession("You have been logged out on all devices.", expected, true);
      });
    } catch (failure) {
      if (failure.response?.status === 401 ||
          (failure.response?.status === 403 && failure.response?.data?.message?.includes("suspended"))) {
        endStoredSession("Please log in again.", expected);
        return true;
      }
      if (getSessionId() === expected)
        setLogoutError(`Could not log out. ${errorMessage(failure)} Please try again.`);
      return false;
    } finally { setLogoutPending(false); }
  };
  const updateUser = (nextUser, expectedId) => {
    if (!expectedId || getSessionId() !== expectedId) return false;
    setUser(nextUser);
    return true;
  };
  return (
    <AuthContext.Provider value={{ user, loading, sessionId, login, logout, updateUser,
      sessionMessage, endSession: endStoredSession, logoutPending, logoutError }}>
      {children}
    </AuthContext.Provider>
  );
}
