import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { createItem, getItems, updateItem } from '../../../services/api';
import { fetchStatuses } from '../../../services/conf/StatusService';
import { DetailsTicket, getPriorityName, getStatusName, getTypeName } from '../../../services/tickets/TicketService';
import ModalTicket from '../../../assets/components/UI/ModalTicket';
import LangueSwitch from '../../../assets/components/UI/LangueSwitch';
import CoutModal from '../../../assets/components/UI/CoutModal';
import OuvertureModal from '../../../assets/components/UI/OuvertureModal';
import { Modal } from 'bootstrap';
import { createReopeningFee } from '../../../services/conf/SuperCostService';

export default function TicketsList() {
    const [columns, setColumns] = useState([]);
    const [ticketsByColumn, setTicketsByColumn] = useState({});
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tenygasy, setTenygasy] = useState(false);

    // États d'attente pour l'ouverture des Modals complexes
    const [pendingTicket, setPendingTicket] = useState(null); // Pour clôture (CoutModal)
    const [pendingReopenTicket, setPendingReopenTicket] = useState(null); // Pour réouverture (OuvertureModal)

    const loadData = async () => {
        try {
            setLoading(true);
            const rawTickets = await getItems("Ticket", { range: "0-9999" });
            const statuses = await fetchStatuses();

            const detailedTickets = (rawTickets || []).map(ticket => ({
                info: ticket
            }));

            const nextTicketsByColumn = {};
            statuses.forEach(status => {
                nextTicketsByColumn[status.name] = detailedTickets.filter(
                    ticket => String(ticket.info.status) === String(status.glpi_link)
                );
            });

            setColumns(statuses);
            setTicketsByColumn(nextTicketsByColumn);
        } catch (er) {
            console.error("Erreur lors du chargement des données Kanban :", er);
            setError(er.message);
        } finally {
            setLoading(false);
        }
    };

    // Action finale appelée après soumission du formulaire d'annulation pourcentage
    const handleReopenFromClosed = async (percentage) => {
        if (!pendingReopenTicket) return;

        try {
            setLoading(true);
            setError("");
            
            // 1. Appel API SQLite (Calcul des frais, suppression dernier super-cost)
            await createReopeningFee(pendingReopenTicket.info.id,percentage);

            // 2. Changement de statut GLPI vers "In Progress" (2) et assignation technicien (4)
            await updateItem("Ticket", pendingReopenTicket.info.id, {
                status: 2,
                _users_id_assign: 4
            });

            // 3. Rechargement global
            await loadData();
            setPendingReopenTicket(null);
        } catch (err) {
            console.error("Erreur lors du traitement de la réouverture :", err);
            setError(err.message || "Une erreur est survenue lors de la réouverture.");
            throw err; // Permet au modal d'intercepter l'erreur et de l'afficher
        } finally {
            setLoading(false);
        }
    };

    const confirmMoveToTermine = async (ticketToMove, targetStatusLink) => {
        try {
            setLoading(true);
            await createItem("ITILSolution", {
                itemtype: "Ticket",
                items_id: ticketToMove.info.id,
                content: "Solution appliquée via l'application."
            });

            await updateItem("Ticket", ticketToMove.info.id, {
                status: targetStatusLink
            });

            await loadData();
        } catch (er) {
            setError(er.message);
            await loadData();
        } finally {
            setLoading(false);
            setPendingTicket(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDragStart = (e, ticketId, sourceColumn) => {
        e.dataTransfer.setData('ticketId', ticketId);
        e.dataTransfer.setData('sourceColumnName', sourceColumn);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetColumnName) => {
        const ticketId = e.dataTransfer.getData('ticketId');
        const sourceColumnName = e.dataTransfer.getData('sourceColumnName');

        if (sourceColumnName === targetColumnName) return;

        const ticketToMove = ticketsByColumn[sourceColumnName]?.find(t => String(t.info.id) === String(ticketId));
        
        const sourceStatusObj = columns.find(c => c.name === sourceColumnName);
        const sourceStatusLink = Number(sourceStatusObj?.glpi_link);

        const targetStatusObj = columns.find(c => c.name === targetColumnName);
        const targetStatusLink = Number(targetStatusObj?.glpi_link);

        if (!ticketToMove || sourceStatusLink === undefined || targetStatusLink === undefined) return;

        // Condition Interceptée : Passage de Terminé (6) à En cours (2)
        if (sourceStatusLink === 6 && targetStatusLink === 2) {
            setPendingReopenTicket(ticketToMove);
            return; // Bloque le drop direct pour attendre la validation du formulaire
        }

        // Passage standard vers Terminé (6)
        if (targetStatusLink === 6) {
            setPendingTicket({
                ticket: ticketToMove,
                sourceColumnName,
                targetColumnName,
                targetStatus: targetStatusLink
            });
            return;
        }

        // Déplacement optimiste par défaut pour les autres statuts
        setTicketsByColumn(prev => {
            const sourceList = prev[sourceColumnName].filter(t => String(t.info.id) !== String(ticketId));
            const updatedTicket = {
                ...ticketToMove,
                info: { ...ticketToMove.info, status: targetStatusLink }
            };
            const targetList = [...(prev[targetColumnName] || []), updatedTicket];
            return {
                ...prev,
                [sourceColumnName]: sourceList,
                [targetColumnName]: targetList
            };
        });

        try {
            setLoading(true);
            await updateItem("Ticket", ticketId, { status: targetStatusLink });
        } catch (er) {
            console.error("Erreur lors du changement de statut :", er);
            setError(er.message);
            await loadData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-vh-100 bg-light position-relative'>
            <Header />

            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50" style={{ zIndex: 1050 }}>
                    <div className="spinner-border text-secondary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Action en cours...</span>
                    </div>
                </div>
            )}

            <div className="container-fluid px-4 py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Tableau Kanban des Tickets</h1>
                        <p className="text-muted small mb-0">Suivez et modifiez l'état d'avancement de vos tickets par glisser-déposer.</p>
                    </div>
                    <div>
                        <LangueSwitch
                            label={tenygasy ? "Gasy" : "Original"}
                            isChecked={tenygasy}
                            onToggle={() => setTenygasy(!tenygasy)}
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2 px-3 mb-0 rounded-3 small">{error}</div>}
                </div>

                <div className="d-flex gap-3 overflow-x-auto pb-3 align-items-start justify-content-center" style={{ minHeight: "calc(100vh - 180px)" }}>
                    {Object.keys(ticketsByColumn).map((columnKey, index) => {
                        const currentColumn = columns.find(c => c.name === columnKey);

                        return (
                            <div
                                key={columnKey}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, columnKey)}
                                className="rounded-4 p-3 shadow-sm border border-secondary-subtle d-flex flex-column"
                                style={{
                                    flex: "0 0 320px",
                                    minHeight: "500px",
                                    backgroundColor: currentColumn?.color || '#ffffff'
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
                                    <h6 className="text-uppercase fw-bold m-0 small d-flex align-items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                        <span className="d-inline-block rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: currentColumn?.color || '#6c757d' }} />
                                        {tenygasy ? currentColumn.gasy_name : columnKey}
                                    </h6>
                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 small">
                                        {ticketsByColumn[columnKey]?.length || 0}
                                    </span>
                                </div>

                                <div className="d-flex flex-column gap-2 flex-grow-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                                    {ticketsByColumn[columnKey]?.map((ticket) => (
                                        <div
                                            key={ticket.info.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, ticket.info.id, columnKey)}
                                            onClick={async () => {
                                                const details = await DetailsTicket(ticket.info.id);
                                                setSelectedTicket(details);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#ticketModal"
                                            className="card border-0 shadow-sm p-3 bg-white"
                                            style={{ cursor: 'grab', transition: 'transform 0.15s ease' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="badge bg-secondary-subtle text-secondary rounded-pill small">
                                                    #{ticket.info.id}
                                                </span>
                                                <span className="badge rounded-pill bg-light border text-dark" style={{ fontSize: "0.75rem" }}>
                                                    {getTypeName(ticket.info.type)}
                                                </span>
                                            </div>

                                            <h6 className="fw-bold text-dark mb-2 text-truncate" title={ticket.info.name}>
                                                {ticket.info.name}
                                            </h6>

                                            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-light">
                                                <small className="text-muted small">
                                                    <i className="bi bi-calendar3 me-1"></i> {ticket.info.date}
                                                </small>
                                                <small className="fw-semibold text-secondary" style={{ fontSize: "0.8rem" }}>
                                                    {getPriorityName(ticket.info.priority)}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {index === 0 && (
                                    <div className="mt-3 pt-2 border-top border-light">
                                        <a href="/myglpi/tickets/create" className="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1">
                                            <i className="bi bi-plus-circle"></i> Ajouter 1 ticket
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals Applicatifs */}
            <ModalTicket selectedTicket={selectedTicket} handleReset={() => setSelectedTicket(null)} />
            <CoutModal pendingTicket={pendingTicket} onClose={() => setPendingTicket(null)} onConfirm={confirmMoveToTermine} />
            
            {/* CORRECTION : Liaison correcte des props et de l'état d'annulation réouverture */}
            <OuvertureModal 
                pendingTicket={pendingReopenTicket} onClose={() => setPendingReopenTicket(null)} onConfirm={handleReopenFromClosed} />
        </div>
    );
}