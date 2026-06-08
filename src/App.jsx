import { useState } from 'react'
import { initSession, getItems, createItem, updateItem, deleteItem } from "./services/api";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from './pages/Layout';
import ProtectedRoute from './services/auth/ProtectedRoute';
import ResetPage from './pages/reset/ResetPage';
import LoginPage from './pages/Login/LoginPage';
import ImportPage from './pages/import/ImportPage';
import Dashboard from './pages/backoffice/dashboard/Dashboard';

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/myglpi" replace/>} />
        <Route path="/myglpi/login" element={<LoginPage />} />
        <Route path="/myglpi" element={ <Layout/> } >
          <Route 
            path="/myglpi/reset" 
            element={
              <ProtectedRoute>
                <ResetPage />
              </ProtectedRoute>} 
          />
          <Route 
            path="/myglpi/import" 
            element={
              <ProtectedRoute>
                <ImportPage />
              </ProtectedRoute>} 
          />
          <Route 
            path="/myglpi/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>} 
          />
        </Route>
      </Routes>

    </BrowserRouter>
  )
}

export default App