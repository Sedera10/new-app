import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { removeAdminAuth } from "../../../services/auth/authCookie";

export default function Sidebar({ show, setShow }) {
    const [activeLink, setActiveLink] = useState("Accueil");
    const [configOpen, setConfigOpen] = useState(false);
    const navigate = useNavigate();

    const links = [
        { name: "Dashboard", icon: "bi-house-door", path: "/myglpi/admin/dashboard" },
        { name: "Status config", icon: "bi-pc-display", path: "/myglpi/admin/status" },
        { name: "Gestion Tickets", icon: "bi-ticket-detailed", path: "/myglpi/admin/tickets" },
    ];

    const goTo = (name, path) => {
        setActiveLink(name);
        navigate(path);
    };

    const handleLogout = () => {
        removeAdminAuth();
        navigate("/")
    }

    return (
        <aside className={`sidebar d-flex flex-column ${show ? "is-open" : "is-collapsed"}`}>
            <div className="logo d-flex justify-content-between align-items-center mb-1">
                <a href="#" className="brand text-decoration-none fs-5 fw-bold">
                    <span className="hide-on-collapse">My Own GLPI</span>
                </a>

                <button
                    type="button"
                    className="btn toggle p-1 border-0"
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
                            onClick={(event) => {
                                event.preventDefault();
                                goTo(link.name, link.path);
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

                <li className="nav-item mb-1">
                    <button
                        type="button"
                        className={`nav-link sidebar-dropdown-toggle d-flex align-items-center justify-content-between rounded p-2 w-100 border-0 ${activeLink === "Configuration" || activeLink.startsWith("Config Data/") ? "nav-link-active" : ""}`}
                        aria-expanded={configOpen}
                        onClick={() => {
                            setActiveLink("Configuration");
                            setConfigOpen((isOpen) => !isOpen);
                        }}
                    >
                        <span className="d-flex align-items-center">
                            <i className="bi bi-gear fs-5 text-center" style={{ width: "24px" }}></i>
                            <span className="ms-3 hide-on-collapse fw-medium">
                                Config Data
                            </span>
                        </span>
                        <i className={`bi ${configOpen ? "bi-chevron-up" : "bi-chevron-down"} hide-on-collapse`}></i>
                    </button>

                    {configOpen && (
                        <ul className="nav flex-column sidebar-submenu mt-1">
                            <li>
                                <a
                                    className={`nav-link fw-medium rounded ${activeLink === "Config Data/Import données" ? "nav-link-active" : ""}`}
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        goTo("Config Data/Import données", "/myglpi/admin/import");
                                    }}
                                >
                                    <i className="bi bi-download fs-6 text-center" style={{ width: "20px" }}></i>
                                    <span className="ms-2 hide-on-collapse">Import données</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    className={`nav-link fw-medium rounded ${activeLink === "Config Data/Réinitialisation" ? "nav-link-active" : ""}`}
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        goTo("Config Data/Réinitialisation", "/myglpi/admin/reset");
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise fs-6 text-center" style={{ width: "20px" }}></i>
                                    <span className="ms-2 hide-on-collapse">Réinitialisation</span>
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            <hr className="divider" />

            <a
                onClick={handleLogout}
                className="btn btn-sm btn-secondary rounded-pill px-3 fw-medium"
                style={{ backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)" }}
            >
                <i className="bi bi-question-circle me-1"></i> Frontoffice
            </a>

            <div className="d-flex align-items-center profile-container toggle" style={{ cursor: "pointer" }}>
                <i className="bi bi-person-circle fs-4 text-center" style={{ width: "24px" }}></i>
                <span className="profile-title fw-semibold ms-3 hide-on-collapse">
                    SEDERA ETU-3343
                </span>
            </div>
        </aside>
    );
}
