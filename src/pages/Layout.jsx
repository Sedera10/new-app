import { useState } from "react";
import { Outlet } from 'react-router-dom';
import Header from "../assets/components/header/Header";
import Sidebar from "../assets/components/sidebar/Sidebar";
import ConfirmDialog from "../assets/components/UI/ConfirmDialog";
import './Layout.css';

export default function Layout() {
    const [show, setShow] = useState(true);
    const [activeLink, setActiveLink] = useState("Accueil");

    const links = [
        { name: "Accueil", icon: "bi-house-door" },
        { name: "Parc", icon: "bi-pc-display" },
        { name: "Assistance", icon: "bi-headset" },
        { name: "Gestion", icon: "bi-briefcase" },
    ];

    return (
        <div className={`layout-wrapper ${show ? "sidebar-open" : "sidebar-collapsed"}`}>
            <Sidebar show={show} setShow={setShow}/>
            <div className="content-wrapper">
                {/* Header */}
                <Header currentPath={activeLink} />

                {/* 3. Le Contenant Principal Variant */}
                <main className="main-content">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}