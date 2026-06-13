import { useState, useEffect } from "react";
import { deleteItem, getItems } from "../../../services/api";
import { DetailsTicket, getPriorityName, getStatusName, getTypeName } from "../../../services/tickets/TicketService";
import ModalTicket from "../../../assets/components/UI/ModalTicket";


export default function TicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    const statusBadgeClass = (status) => {
        const statusName = getStatusName(status);
        if (statusName === 'Nouveau') return "text-bg-primary";
        if (statusName === 'Closed' || statusName === 'Terminé') return "text-bg-success";
        if (statusName === 'In progress') return "text-bg-warning text-dark";
        if (statusName === 'Solved') return "text-bg-info text-dark";
        return "text-bg-secondary";
    };

    const priorityClass = (priority) => {
        const priorityName = getPriorityName(priority);
        if (priorityName?.toLowerCase().includes("très")) return "text-danger fw-bold";
        if (priorityName?.toLowerCase().includes("haute")) return "text-warning fw-bold";
        return "text-secondary fw-medium";
    };

    const handleViewTicket = async (idTicket) => {
        try {
            const det = await DetailsTicket(idTicket);
            setSelectedTicket(det);
        } catch (error) {
            console.error(`Erreur lors du chargement du ticket #${idTicket} :`, error);
        }
    };

    useEffect(() => {
        const formatTickets = async () => {
            try {
                setPage(1);
                setLoading(true);
                const initTickets = await getItems("Ticket", { range:"0-9999"});
                const formatted = (initTickets || []).map(ticket => ({
                    info: ticket 
                }));
                setTickets(formatted);
            } catch (error) {
                console.error("Erreur lors du chargement des tickets :", error);
            } finally {
                setLoading(false);
            }
        };

        formatTickets();
    }, []);

    const handleResetSelected = () => {
        setSelectedTicket(null);
    }

    const handleDelete = async (idTicket) => {
        try {
            setLoading(true)
            await deleteItem("Ticket", idTicket, {force_purge: true})
            setTickets((currentTickets) => currentTickets.filter((ticket) => ticket.info.id !== idTicket));
        } catch (err) {
            console.log(`Erreur de suppresion du ticket #${idTicket} . Erreur : ${err}`)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(15); 
    const totalPages = Math.ceil(tickets.length / limit);
    const indexDebut = (page - 1) * limit;
    const indexFin = indexDebut + limit;
    const elementsDeLaPage = tickets.slice(indexDebut, indexFin);
    const getPages = () => {
        const max = 5;
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + max - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    return (
        <div className="container-fluid px-4 py-4" style={{ backgroundColor: "var(--bg-body)", minHeight: "calc(100vh - 70px)" }}>
            <div className="card shadow-sm border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Gestion des Tickets</h1>
                        <p className="text-muted small m-0 mt-1">Consultez, visualisez et supprimez les tickets GLPI.</p>
                    </div>
                    <a 
                        href="/myglpi/tickets/create" 
                        className="btn rounded-pill px-4 py-2 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        style={{ backgroundColor: "var(--bg-btn-primary)", color: "var(--text-btn-primary)" }}
                    >
                        <i className="bi bi-plus-circle"></i> Ajouter un ticket
                    </a>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead className="border-bottom border-light" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                            <tr>
                                <th className="text-muted small text-uppercase fw-bold ps-2">#</th>
                                <th className="text-muted small text-uppercase fw-bold">Titre</th>
                                <th className="text-muted small text-uppercase fw-bold">Type</th>
                                <th className="text-muted small text-uppercase fw-bold">Priorité</th>
                                <th className="text-muted small text-uppercase fw-bold">Statut</th>
                                <th className="text-muted small text-uppercase fw-bold">Date</th>
                                <th className="text-muted small text-uppercase fw-bold text-end pe-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div
                                            className="spinner-border text-secondary"
                                            role="status"
                                        />
                                        <p className="mt-2 mb-0 text-muted">
                                            Chargement des tickets...
                                        </p>
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        Aucun ticket disponible.
                                    </td>
                                </tr>
                            ) : (
                                elementsDeLaPage.map(ticket => (
                                    <tr key={ticket.info.id} className="border-bottom border-light last-border-0">
                                        <td className="fw-bold text-secondary ps-2">#{ticket.info.id}</td>
                                        <td className="fw-semibold text-dark">
                                            {ticket.info.name}
                                            <div className="small text-muted text-truncate" style={{ maxWidth: "360px" }}>
                                                {ticket.info.content || "Aucune description"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 border bg-white text-dark`}>
                                                {getTypeName(ticket.info.type)}
                                            </span>
                                        </td>
                                        <td className={priorityClass(ticket.info.priority)}>
                                            {getPriorityName(ticket.info.priority)}
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${statusBadgeClass(ticket.info.status)}`}>
                                                {getStatusName(ticket.info.status)}
                                            </span>
                                        </td>
                                        <td className="text-muted small">
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {ticket.info.date}
                                        </td>
                                        <td className="text-end pe-2">
                                            <button 
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 me-2 shadow-none"
                                                onClick={() => handleViewTicket(ticket.info.id)}
                                                data-bs-toggle="modal" 
                                                data-bs-target="#ticketModal"
                                                title="Voir les détails"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-none"
                                                onClick={() => handleDelete(ticket.info.id)}
                                                title="Supprimer"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* ================= PAGINATION FRONTEND ACCORDÉE AUX FILTRES ================= */}
                        {totalPages > 1 && (
                            <nav className="d-flex justify-content-center mt-4 mb-2">
                                <ul className="pagination pagination-sm gap-1 mb-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border px-3 shadow-none" onClick={() => goToPage(page - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    
                                    {getPages().map(p => (
                                        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                            <button 
                                                className="page-link rounded-3 border px-3 shadow-none fw-medium"
                                                style={p === page ? { backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)", color: "#fff" } : { color: "var(--text-secondary)" }}
                                                onClick={() => goToPage(p)}
                                            >
                                                {p}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border px-3 shadow-none" onClick={() => goToPage(page + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                </div>
            </div>

            {/* Modal for Ticket details */}
            <ModalTicket selectedTicket={selectedTicket} handleReset={handleResetSelected} />
            
        </div>
    );
}
