import React from 'react';
import './Header.css';

export default function Header({ currentPath = "Accueil" }) {
  return (
    <header className="main-header d-flex align-items-center justify-content-between px-4">
      
      <div className="d-flex align-items-center">
        <p className="mb-0 fw-medium">{currentPath}</p>
      </div>

      {/* 2. DROITE : Profil Utilisateur */}
      <div className="user-profile d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
        <span className="fw-medium text-secondary">Admin admin</span>
        <i className="bi bi-person-circle fs-4 text-dark"></i>
      </div>

    </header>
  );
}