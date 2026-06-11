import { useState, useEffect } from "react";
import { deleteItem, getItems } from "../../../services/api";
import { DetailsTicket, getPriorityName, getStatusName, getTypeName } from "../../../services/tickets/TicketService";
import ModalTicket from "../../../assets/components/UI/ModalTicket";


export default function TicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const formatTickets = async () => {
            try {
                setLoading(true);
                const initTickets = await getItems("Ticket");
                const formatted = (initTickets || []).map(ticket => ({
                    info: ticket 
                }));
                setTickets(formatted);
            } catch (error) {
                console.error("Erreur lors du chargement des tickets :",error);
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

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h1 className="mb-4 fw-bold" style={{ color : "var(--text-secondary)"}}>Gestion des Tickets</h1>
                <div className="mt-3 pt-2 border-top border-light">
                    <a 
                        href="/myglpi/tickets/create" 
                        className="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1"
                    >
                        <i className="bi bi-plus-circle"></i> Ajouter 1 ticket
                    </a>
                </div>
            </div>

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
                                                className="btn btn-sm btn-secondary rounded-pill px-3 me-2"
                                                onClick={async () => {
                                                    const det = await DetailsTicket(ticket.info.id);
                                                    setSelectedTicket(det);
                                                }}
                                                data-bs-toggle="modal" 
                                                data-bs-target="#ticketModal"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-secondary rounded-pill px-3"
                                                onClick={() => handleDelete(ticket.info.id)}
                                            >
                                                <i className="bi bi-trash"></i>
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
            <ModalTicket selectedTicket={selectedTicket} handleReset={handleResetSelected} />
            
        </div>
    );
}
