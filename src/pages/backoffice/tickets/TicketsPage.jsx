import { useState } from "react";

// Mock data
const MOCK_TICKETS = [
    { id: 1, title: "Problème d'impression", type: "Incident", priority: "Haute", status: "Nouveau", date: "2026-06-08", description: "L'imprimante HP-01 ne répond plus." },
    { id: 2, title: "Installation Photoshop", type: "Demande", priority: "Basse", status: "En cours", date: "2026-06-07", description: "Demande d'installation de Photoshop pour le service Com." },
    { id: 3, title: "Coupure réseau", type: "Incident", priority: "Critique", status: "Résolu", date: "2026-06-06", description: "Plus de connexion réseau sur le switch Bateau." },
];

export default function TicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);

    return (
        <div className="container p-4">
            <h1 className="mb-4 fw-bold" style={{ color : "var(--text-secondary)"}}>Gestion des Tickets</h1>

            <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="border-bottom text-muted">
                            <tr>
                                <th>#</th>
                                <th>Titre</th>
                                <th>Type</th>
                                <th>Priorité</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_TICKETS.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="fw-medium text-secondary">{ticket.id}</td>
                                    <td className="fw-bold">{ticket.title}</td>
                                    <td>
                                        <span className={`badge rounded-pill text-bg-light border text-dark`}>
                                            {ticket.type}
                                        </span>
                                    </td>
                                    <td>{ticket.priority}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${
                                            ticket.status === 'Nouveau' ? 'text-bg-primary' :
                                            ticket.status === 'Résolu' ? 'text-bg-success' : 'text-bg-warning'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="text-muted small">{ticket.date}</td>
                                    <td className="text-end">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                            onClick={() => setSelectedTicket(ticket)}
                                            data-bs-toggle="modal" 
                                            data-bs-target="#ticketModal"
                                        >
                                            Voir la fiche
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Ticket details */}
            <div className="modal fade" id="ticketModal" tabIndex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4">
                        <div className="modal-header border-bottom-0">
                            <h5 className="modal-title fw-bold" id="ticketModalLabel">
                                Fiche Ticket #{selectedTicket?.id}
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4 pt-2">
                            {selectedTicket && (
                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <h6 className="text-muted small mb-1">Titre</h6>
                                        <p className="fw-medium mb-0">{selectedTicket.title}</p>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <h6 className="text-muted small mb-1">Type</h6>
                                            <span className="badge bg-light text-dark border">{selectedTicket.type}</span>
                                        </div>
                                        <div className="col-6">
                                            <h6 className="text-muted small mb-1">Statut</h6>
                                            <span className="badge bg-secondary">{selectedTicket.status}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <h6 className="text-muted small mb-1">Priorité</h6>
                                            <p className="mb-0 fw-medium">{selectedTicket.priority}</p>
                                        </div>
                                        <div className="col-6">
                                            <h6 className="text-muted small mb-1">Date</h6>
                                            <p className="mb-0 fw-medium">{selectedTicket.date}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-muted small mb-1">Description</h6>
                                        <div className="p-3 bg-light rounded-3 text-secondary" style={{ fontSize: "0.9rem"}}>
                                            {selectedTicket.description}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-top-0">
                            <button type="button" className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Fermer</button>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}