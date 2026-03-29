// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // State to hold user data
  const [isLoading, setIsLoading] = useState(true); // To handle initial auth check

  const fetchUser = useCallback(async (authToken) => {
    if (authToken) {
      try {
        const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
        // We use the /api/auth/profile route we built in the first phase!
        const response = await axios.get(`${BASE_URL}/api/auth/profile`, config);
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user", error);
        // If token is invalid, log out
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    fetchUser(newToken); // Fetch user data right after login
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};