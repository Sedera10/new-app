import React, {useState} from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({show, setShow}) {
    const [activeLink, setActiveLink] = useState("Accueil");
    const navigate = useNavigate();

    const links = [
        { name: "Dashboard", icon: "bi-house-door", path: "/myglpi/dashboard" },
        { name: "Éléments (Front)", icon: "bi-pc-display", path: "/myglpi/front/elements" },
        { name: "Nouveau Ticket (Front)", icon: "bi-plus-circle", path: "/myglpi/front/tickets/create" },
        { name: "Gestion Tickets (Back)", icon: "bi-ticket-detailed", path: "/myglpi/tickets" },
    ];
    return (
        <aside className={`sidebar d-flex flex-column ${show ? "is-open" : "is-collapsed"}`}>
            <div className="logo d-flex justify-content-between align-items-center mb-1">
                <a
                    href="#"
                    className="brand text-decoration-none fs-5 fw-bold"
                >
                    <span className="hide-on-collapse">My Own GLPI</span>
                </a>

                <button
                    className="btn toggle p-1 border-0" /* border-0 enlève le contour Bootstrap au clic */
                    onClick={() => setShow(!show)}
                    title="Toggle menu"
                >
                    <i className="bi bi-list fs-4"></i>
                </button>
            </div>

            <hr className="divider" />

            <ul className="nav flex-column mb-auto">
                {links.map((link) => (
                    <li className="nav-item mb-1" key={link.name}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveLink(link.name);
                                if (link.path) navigate(link.path);
                            }}
                            className={`nav-link d-flex align-items-center rounded p-2 ${activeLink === link.name ? "nav-link-active" : ""}`}
                        >
                            <i className={`bi ${link.icon} fs-5 text-center`} style={{ width: "24px" }}></i>
                            <span className="ms-3 hide-on-collapse fw-medium">
                                {link.name}
                            </span>
                        </a>
                    </li>
                ))}
                {/* Dropdown */}
                <li className="nav-item dropdown mb-1">
                    <a
                        href="#"
                        className={`nav-link d-flex align-items-center justify-content-between rounded p-2 dropdown-toggle ${activeLink === "Configuration" ? "nav-link-active" : ""}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveLink("Configuration"); // Remplacez par le nom fixe ou dynamique souhaité
                        }}
                    >
                        {/* Partie gauche : Icône + Texte */}
                        <div className="d-flex align-items-center">
                            <i className="bi bi-gear fs-5 text-center" style={{ width: "24px" }}></i>
                            <span className="ms-3 hide-on-collapse fw-medium">
                                Config Data
                            </span>
                        </div>
                    </a>

                    {/* Le menu caché qui va s'ouvrir proprement */}
                    <ul className="dropdown-menu dropdown-menu-end border-0 bg-transparent">
                        <li>
                            <a 
                                className={`dropdown-item nav-link fw-medium rounded ${activeLink === "Config Data/Import données" ? "nav-link-active" : ""}`}
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setActiveLink("Config Data/Import données"); navigate("/myglpi/import") }}
                                >
                                <i className="bi bi-download fs-6 text-center" style={{ width: "20px" }}></i>
                                <span className='ms-2'>Import données</span>
                            </a>
                        </li>
                        <li>
                            <a 
                                className={`dropdown-item nav-link fw-medium rounded ${activeLink === "Config Data/Réinitialisation" ? "nav-link-active" : ""}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveLink("Config Data/Réinitialisation"); navigate("/myglpi/reset") }}
                                >
                                <i className="bi bi-arrow-counterclockwise fs-6 text-center" style={{ width: "20px" }}></i>
                                <span className='ms-2'>Réinitialisation</span>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>

            <hr className="divider" />

            {/* Structure du profil optimisée */}
            <div className="d-flex align-items-center profile-container toggle" style={{ cursor: 'pointer' }}>
                <i className="bi bi-person-circle fs-4 text-center" style={{ width: "24px" }}></i>
                <span className="profile-title fw-semibold ms-3 hide-on-collapse">
                    SEDERA ETU-3343
                </span>
            </div>
        </aside>
    );
}