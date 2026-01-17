/**
 * useAuth Hook
 * Manages authentication state and provides utility functions
 */
import { useState, useCallback } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  const login = useCallback((token, userRole, id) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setRole(userRole);
    setUserId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setRole(null);
    setUserId(null);
  }, []);

  return {
    isAuthenticated,
    role,
    userId,
    login,
    logout,
  };
};
