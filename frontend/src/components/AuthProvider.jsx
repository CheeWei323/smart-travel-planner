import { useEffect, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import api from "../services/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [sessionMessage, setSessionMessage] = useState("");
  useEffect(() => {
    let active = true;
    const ended = (event) => {
      setUser(null);
      setSessionMessage(event.detail);
    };
    window.addEventListener("travelwise:session-ended", ended);
    if (localStorage.getItem("token")) {
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (active) setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
      window.removeEventListener("travelwise:session-ended", ended);
    };
  }, []);
  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setSessionMessage("");
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSessionMessage("");
  };
  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, sessionMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}
