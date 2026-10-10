import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { authApi } from "../api/endpoints/authApi";

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update localStorage and state on login
  const saveData = (token, userData) => {
    if (token) localStorage.setItem("authToken", token);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    if (token) setAuthToken(token);
    if (userData) setUser(userData);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        saveData(res.data.token, res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = React.useCallback((newUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...newUserData };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Keep state synced with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem("authToken"));
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userData: user,
        isAuthenticated: !!authToken,
        isLoading,
        login,
        logout,
        saveData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
