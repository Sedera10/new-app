import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  let isAuthenticated = false;
  if(sessionStorage.getItem("glpi_session_token")){
    isAuthenticated= true
  }

  if (!isAuthenticated) {
    return <Navigate to="/myglpi/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;