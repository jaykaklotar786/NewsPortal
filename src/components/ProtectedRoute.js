import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const getFromStorage = (key) => {
  return sessionStorage.getItem(key);
};

const ProtectedRoute = ({ children, requireAuth = true, requiredRole }) => {
  const location = useLocation();
  
  const isAuthenticated = () => {
    const token = getFromStorage('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      return true;
    } catch (error) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return false;
    }
  };

  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    const userString = getFromStorage('user');
    if (!userString) return false;
    try {
      const user = JSON.parse(userString);
      return user?.role === requiredRole;
    } catch {
      return false;
    }
  };

  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !hasRequiredRole()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
