export default function Header () {
    return (
        <header className="navbar navbar-expand bg-white border-bottom px-4 py-3 sticky-top shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                
                <span className="navbar-brand fw-bold text-dark d-flex align-items-center gap-2 fs-5 font-monospace">
                    <i className="bi bi-box text-secondary"></i> My Own GLPI
                </span>
                <div className="d-flex gap-2">
                    <a href="/myglpi/elements" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium">
                        <i className="bi bi-collection me-1"></i> Elements
                    </a>
                    <a href="/myglpi/tickets/create" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium">
                        <i className="bi bi-collection me-1"></i> Add Ticket
                    </a>
                    <a href="/myglpi/tickets" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium">
                        <i className="bi bi-collection me-1"></i> Tickets
                    </a>
                    <a href="/myglpi/admin" className="btn btn-sm btn-secondary rounded-pill px-3 fw-medium" style={{ backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)" }}>
                        <i className="bi bi-question-circle me-1"></i> Backoffice
                    </a>
                </div>
            </div>
        </header>
    )
}