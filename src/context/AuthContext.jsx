import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  isAuthenticated as checkToken,
} from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkToken());
  const [user, setUser] = useState(null);

  const clearCaches = async () => {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
  };

  const handleInvalidSession = useCallback(() => {
    localStorage.clear();
    clearCaches();
    setUser(null);
    setIsAuthenticated(false);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        Promise.all(registrations.map(r => r.unregister())).then(() => {
          navigator.serviceWorker.register('/service-worker.js?force=' + Date.now()).then(() => {
            console.log("Service Worker reinstalado.");
          });
        });
      });
    }
  }, []);

  useEffect(() => {
    if (checkToken()) {
      getCurrentUser()
        .then((data) => {
          const previousUser = localStorage.getItem("last_user_id");
          if (previousUser && previousUser !== String(data.id)) {
            localStorage.clear();
            clearCaches();
            window.location.reload();
          } else {
            setUser(data);
            setIsAuthenticated(true);
            localStorage.setItem("last_user_id", data.id);
          }
        })
        .catch(() => {
          handleInvalidSession();
        });
    } else {
      handleInvalidSession();
    }
  }, [handleInvalidSession]);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    const previousUser = localStorage.getItem("last_user_id");

    if (previousUser && previousUser !== String(data.user.id)) {
      localStorage.clear();
      await clearCaches();
    }

    setUser(data.user);
    setIsAuthenticated(true);
    localStorage.setItem("last_user_id", data.user.id);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    logoutApi();
    handleInvalidSession();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
