import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [role, setRole] = useState(() => sessionStorage.getItem("role") || null);
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = () => {
      const u = sessionStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
      setRole(sessionStorage.getItem("role") || null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (userObj, token) => {
    sessionStorage.setItem("user", JSON.stringify(userObj));
    sessionStorage.setItem("role", userObj.role);
    if (token) sessionStorage.setItem("token", token);
    setUser(userObj);
    setRole(userObj.role);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");
    setUser(null);
    setRole(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  // If for some reason the hook is used outside of a provider, return safe defaults
  if (!ctx) {
    return { user: null, role: null, login: () => {}, logout: () => {} };
  }
  return ctx;
}

export default AuthContext;
