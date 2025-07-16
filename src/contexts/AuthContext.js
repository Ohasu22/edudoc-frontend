import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('edudoc-auth') === 'true';
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('edudoc-user');
    return stored ? JSON.parse(stored) : null;
  });

  // ✅ Derived value to check if current user is an admin
  const isAdmin = user?.email?.startsWith('admin@') || false;

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const token = res.data.token;

      const userData = {
        email,
        token
      };

      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem('edudoc-auth', 'true');
      localStorage.setItem('edudoc-user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      return true;
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('edudoc-auth');
    localStorage.removeItem('edudoc-user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
