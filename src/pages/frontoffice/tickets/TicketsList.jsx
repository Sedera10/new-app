import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { createItem, getItems, updateItem } from '../../../services/api';
import { fetchStatuses } from '../../../services/conf/StatusService';
import { DetailsTicket, getPriorityName, getStatusName, getTypeName } from '../../../services/tickets/TicketService';
import ModalTicket from '../../../assets/components/UI/ModalTicket';

export default function TicketsList() {
    const [columns, setColumns] = useState([]);
    const [ticketsByColumn, setTicketsByColumn] = useState({});
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fonction centrale de chargement des données
    const loadData = async () => {
        try {
            setLoading(true);
            const rawTickets = await getItems("Ticket");
            const statuses = await fetchStatuses();
            
            // On récupère les détails complets (coûts, historique, etc.) pour chaque ticket
            const detailedTickets = await Promise.all(
                (rawTickets || []).map(ticket => DetailsTicket(ticket.id))
            );

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

    const ChangeToInprogres = async (ticket) => {
      try {
          setError('')
          const id = ticket.id
          const statusNow = ticket.status
          const payload = {
              status: 2,
              _users_id_assign: 4
          }
          if(statusNow == 2) return
          await updateItem("Ticket", id, payload)
      } catch (er) {
          console.log("Erreur de changement de status vers 'In progress' ",er)
          setError(er.message)
      }
    }

    const ChangeToTermine = async (ticket) => {
      try {
          setError('');
          const currentState = ticket.status;
          if (currentState === 5 || currentState === 6) return;
          if (currentState === 1) {
              await updateItem("Ticket", ticket.id, { _users_id_assign: 4 });
          }

          const payload = {
              itemtype: "Ticket",
              items_id: ticket.id,
              content: `Solution appliquée via l'application. (Statut précédent : ${currentState})`
          };
          
          await createItem("ITILSolution", payload);
      } catch (er) {
          console.log("Erreur de changement de status vers 'Terminé' ", er);
          setError(er.message);
      }
    }

    const ChangeToNouveau = async (ticket) => {
      try {
          setError('');
          if (ticket.status === 1) return;

          await updateItem("Ticket", ticket.id, { status: 1, _users_id_assign: 0 });
      } catch (er) {
          console.log("Erreur de changement de status vers 'Nouveau' ", er);
          setError(er.message);
      }
    }

    useEffect(() => {
        loadData();
    }, []);

    // Début du glissement d'un ticket
    const handleDragStart = (e, ticketId, sourceColumn) => {
        e.dataTransfer.setData('ticketId', ticketId);
        // CORRECTION : On utilise bien 'sourceColumnName' ici pour concorder avec handleDrop
        e.dataTransfer.setData('sourceColumnName', sourceColumn);
    };

    // Autoriser le survol pour permettre le dépôt
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Dépôt du ticket dans une nouvelle colonne
    const handleDrop = async (e, targetColumnName) => {
        const ticketId = e.dataTransfer.getData('ticketId');
        const sourceColumnName = e.dataTransfer.getData('sourceColumnName');

        // Si déposé dans la même colonne, aucun traitement requis
        if (sourceColumnName === targetColumnName) return;

        // Trouver le ticket déplacé et le lien GLPI cible
        const ticketToMove = ticketsByColumn[sourceColumnName]?.find(t => String(t.info.id) === String(ticketId));
        const targetStatusObj = columns.find(c => c.name === targetColumnName);
        const targetStatusLink = targetStatusObj?.glpi_link;

        if (!ticketToMove || targetStatusLink === undefined) return;

        // Mise à jour optimiste de l'interface (instantané pour l'utilisateur)
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

        // Persistance de la modification dans l'API
        try {
            setLoading(true);
            await updateItem("Ticket", ticketId, { status: targetStatusLink });
        } catch (er) {
            console.error("Erreur lors du changement de statut :", er);
            setError(er.message);
            // En cas d'échec, on recharge proprement les données réelles
            await loadData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-vh-100 bg-light position-relative'>
            <Header />

            {/* Spinner global de chargement */}
            {loading && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50" 
                    style={{ zIndex: 1050 }}
                >
                    <div className="spinner-border text-secondary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Action en cours...</span>
                    </div>
                </div>
            )}

            <div className="container-fluid px-4 py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Tableau Kanban</h1>
                        <p className="text-muted small mb-0">Suivez et modifiez l'état d'avancement de vos tickets par glisser-déposer.</p>
                    </div>
                    {error && <div className="alert alert-danger py-2 px-3 mb-0 rounded-3 small">{error}</div>}
                </div>

                {/* CORRECTION : Ajout de 'justify-content-center' pour centrer les colonnes au milieu de la page */}
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
                                    // CORRECTION : Utilise 'currentColumn?.color' issu de sqlite à la place de columnKey.color
                                    backgroundColor: currentColumn?.color || '#ffffff'
                                }}
                            >
                                {/* Header de la colonne */}
                                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
                                    <h6 className="text-uppercase fw-bold m-0 small d-flex align-items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                        <span 
                                            className="d-inline-block rounded-circle" 
                                            style={{ width: "10px", height: "10px", backgroundColor: currentColumn?.color || '#6c757d' }}
                                        />
                                        {columnKey}
                                    </h6>
                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 small">
                                        {ticketsByColumn[columnKey]?.length || 0}
                                    </span>
                                </div>

                                {/* Liste des Cartes de Tickets */}
                                <div className="d-flex flex-column gap-2 flex-grow-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                                    {ticketsByColumn[columnKey]?.map((ticket) => (
                                        <div
                                            key={ticket.info.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, ticket.info.id, columnKey)}
                                            onClick={() => setSelectedTicket(ticket)}
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
                                        <a 
                                            href="/myglpi/tickets/create" 
                                            className="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1"
                                        >
                                            <i className="bi bi-plus-circle"></i> Ajouter 1 ticket
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Bootstrap */}
            <ModalTicket selectedTicket={selectedTicket} /> 
        </div>
    );
}