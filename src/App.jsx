import { useState } from 'react'
import { initSession, getItems, createItem, updateItem, deleteItem } from "./services/api";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from './pages/Layout';
import ProtectedRoute from './services/auth/ProtectedRoute';
import ResetPage from './pages/reset/ResetPage';
import LoginPage from './pages/login/LoginPage';
import ImportPage from './pages/import/ImportPage';
import Dashboard from './pages/backoffice/dashboard/Dashboard';
import TicketsPage from './pages/backoffice/tickets/TicketsPage';
import ElementsList from './pages/frontoffice/elements/ElementsList';
import CreateTicket from './pages/frontoffice/tickets/CreateTicket';
import TicketsList from './pages/frontoffice/tickets/TicketsList';
import StatusConf from './pages/backoffice/sqlite/StatusConfig';
import TicketsSimple from './pages/frontoffice/tickets/TicketSimple';
import IndexPage from './pages/IndexPage';
import ModifTicket from './pages/frontoffice/tickets/ModifTicket';
import ItemCostReport from './pages/backoffice/repports/ItemCostReport';

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage/>} />
        <Route path="/myglpi" element={<IndexPage/>} />
        <Route path="/myglpi/elements" element={<ElementsList />} />
        <Route path="/myglpi/tickets" element={<TicketsList />} />
        <Route path="/myglpi/reports" element={<ItemCostReport />} />
        <Route path="/myglpi/tickets/:id" element={<ModifTicket />} />
        <Route path="/myglpi/tickets_2" element={<TicketsSimple />} />
        <Route path="/myglpi/tickets/create" element={<CreateTicket />} />
        {/* Backoffice */}
        <Route path="/myglpi/admin/login" element={<LoginPage />} />
        <Route 
          path="/myglpi/admin" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } 
        >
          <Route path="/myglpi/admin/reset" element={<ResetPage />} />
          <Route path="/myglpi/admin/import" element={<ImportPage />} />
          <Route path="/myglpi/admin/dashboard" element={<Dashboard />} />
          <Route path="/myglpi/admin/tickets" element={<TicketsPage />} />
          <Route path="/myglpi/admin/status" element={<StatusConf />} />
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App