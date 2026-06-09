import { useState, useEffect } from "react";
import { getItems } from "../../../services/api";
import { forEach } from "jszip";
import { DetailsTicket, getPriorityName, getStatusName, getTypeName } from "../../../services/tickets/TicketService";
import { DetailsTickets } from "../../../services/dashboard/DashboardService";
import ModalTicket from "../../../assets/components/UI/ModalTicket";

// Mock data
const MOCK_TICKETS = [
    { id: 1, title: "Problème d'impression", type: "Incident", priority: "Haute", status: "Nouveau", date: "2026-06-08", description: "L'imprimante HP-01 ne répond plus." },
    { id: 2, title: "Installation Photoshop", type: "Demande", priority: "Basse", status: "En cours", date: "2026-06-07", description: "Demande d'installation de Photoshop pour le service Com." },
    { id: 3, title: "Coupure réseau", type: "Incident", priority: "Critique", status: "Résolu", date: "2026-06-06", description: "Plus de connexion réseau sur le switch Bateau." },
];

export default function TicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const formatTickets = async () => {
            try {
                setLoading(true);
                const initTickets = await getItems("Ticket");
                const formatted = await Promise.all(
                    initTickets.map(ticket =>
                        DetailsTicket(ticket.id)
                    )
                );
                setTickets(formatted);
            } catch (error) {
                console.error("Erreur lors du chargement des tickets :",error);
            } finally {
                setLoading(false);
            }
        };

        formatTickets();
    }, []);

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
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div
                                            className="spinner-border text-secondary"
                                            role="status"
                                        />
                                        <p className="mt-2 mb-0">
                                            Chargement des tickets...
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.info.id}>
                                        <td className="fw-medium text-secondary">{ticket.info.id}</td>
                                        <td className="fw-bold">{ticket.info.name}</td>
                                        <td>
                                            <span className={`badge rounded-pill text-bg-light border text-dark`}>
                                                {getTypeName(ticket.info.type)}
                                            </span>
                                        </td>
                                        <td>{getPriorityName(ticket.info.priority)}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${
                                                getStatusName(ticket.info.status) === 'New' ? 'text-bg-primary' :
                                                getStatusName(ticket.info.status) === 'Solved' ? 'text-bg-success' : 'text-bg-warning'
                                            }`}>
                                                {getStatusName(ticket.info.status)}
                                            </span>
                                        </td>
                                        <td className="text-muted small">{ticket.info.date}</td>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Ticket details */}
            <ModalTicket selectedTicket={selectedTicket} />
            
        </div>
    );
}