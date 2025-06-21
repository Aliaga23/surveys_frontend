import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  isAuthenticated as checkToken,
} from "../services/auth"; // ajusta ruta si es distinta

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (checkToken()) {
      getCurrentUser().then(setUser).catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      });
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials); 
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutApi(); 
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
