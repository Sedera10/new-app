import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from './authCookie';

const ProtectedRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/myglpi/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;