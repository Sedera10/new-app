import { NavLink } from "react-router-dom";

export default function Header () {
    return (
        <header className="navbar navbar-expand bg-white border-bottom px-4 py-3 sticky-top shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                
                <span className="navbar-brand fw-bold text-dark d-flex align-items-center gap-2 fs-5 font-monospace">
                    <i className="bi bi-box text-secondary"></i> My Own GLPI
                </span>
                <div className="d-flex gap-2">
                    <NavLink to="/myglpi/elements" className={({ isActive }) =>
                        `btn btn-sm rounded-pill px-3 fw-medium ${isActive ? "btn-secondary text-white" : "btn-outline-secondary"}`
                    }>
                        <i className="bi bi-collection me-1"></i> Elements
                    </NavLink>
                    <NavLink to="/myglpi/tickets/create" className={({ isActive }) =>
                        `btn btn-sm rounded-pill px-3 fw-medium ${isActive ? "btn-secondary text-white" : "btn-outline-secondary"}`
                    }>
                        <i className="bi bi-collection me-1"></i> Add Ticket
                    </NavLink>
                    <NavLink to="/myglpi/tickets" className={({ isActive }) =>
                        `btn btn-sm rounded-pill px-3 fw-medium ${isActive ? "btn-secondary text-white" : "btn-outline-secondary"}`
                    }>
                        <i className="bi bi-collection me-1"></i> Tickets
                    </NavLink>
                    <NavLink to="/myglpi/reports" className={({ isActive }) =>
                        `btn btn-sm rounded-pill px-3 fw-medium ${isActive ? "btn-secondary text-white" : "btn-outline-secondary"}`
                    }>
                        <i className="bi bi-collection me-1"></i> Reports
                    </NavLink>
                    <NavLink to="/myglpi/admin" className={({ isActive }) =>
                        `btn btn-sm rounded-pill px-3 fw-medium ${isActive ? "btn-secondary text-white" : "btn-secondary"}`
                    } style={{ backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)" }}>
                        <i className="bi bi-question-circle me-1"></i> Backoffice
                    </NavLink>
                </div>
            </div>
        </header>
    )
}