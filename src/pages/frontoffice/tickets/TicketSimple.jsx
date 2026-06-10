    import React, { useEffect, useState } from 'react';
    import Header from '../Header';
    import { createItem, getItems, updateItem } from '../../../services/api';
    import { DetailsTicket, getPriorityName, getTypeName } from '../../../services/tickets/TicketService';
    import ModalTicket from '../../../assets/components/UI/ModalTicket';
    import LangueSwitch from '../../../assets/components/UI/LangueSwitch';
    import { fetchStatuses } from '../../../services/conf/StatusService';

    export default function TicketsSimple() {
        const [tickets, setTickets] = useState([]); // Tableau simple contenant tous les tickets détaillés
        const [selectedTicket, setSelectedTicket] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [states, setStates] = useState([]);
        const [tickets_1, setTickets_1] = useState([]);
        const [tickets_2, setTickets_2] = useState([]);
        const [tickets_3, setTickets_3] = useState([]);

        // Chargement initial des tickets
        const loadData = async () => {
            try {
                setLoading(true);
                const rawTickets = await getItems("Ticket");
                // Récupération des détails complets pour chaque ticket
                const detailedTickets = await Promise.all(
                    (rawTickets || []).map(ticket => DetailsTicket(ticket.id))
                );
                const statuses = await fetchStatuses();

                setTickets(detailedTickets);
                setStates(statuses);

                setTickets_1(detailedTickets.filter(t => String(t.info.status) === '1'))
                setTickets_2(detailedTickets.filter(t => String(t.info.status) === '2'))
                setTickets_3(detailedTickets.filter(t => String(t.info.status) === '5' || String(t.info.status) === '6'))
            } catch (er) {
                console.error("Erreur de chargement :", er);
                setError(er.message);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            loadData();
        }, []);

        // --- TES FONCTIONS DE CHANGEMENT DE STATUT ---
        
        const ChangeToInprogres = async (ticket) => {
            try {
                setError('');
                const id = ticket.id;
                const statusNow = ticket.status;
                const payload = {
                    status: 2,
                    _users_id_assign: 4
                };
                if (statusNow == 2) return;
                await updateItem("Ticket", id, payload);
            } catch (er) {
                console.log("Erreur de changement de status vers 'In progress' ", er);
                setError(er.message);
            }
        };

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
        };

        const ChangeToNouveau = async (ticket) => {
            try {
                setError('');
                if (ticket.status === 1) return;

                await updateItem("Ticket", ticket.id, { status: 1, _users_id_assign: 0 });
            } catch (er) {
                console.log("Erreur de changement de status vers 'Nouveau' ", er);
                setError(er.message);
            }
        };

        // --- GESTION DU DRAG & DROP ---
        
        // Quand on commence à glisser une carte
        const handleDragStart = (e, ticketId) => {
            e.dataTransfer.setData('ticketId', ticketId);
        };

        // Obligatoire pour autoriser le dépôt
        const handleDragOver = (e) => {
            e.preventDefault();
        };

        // Quand on lâche le ticket dans une colonne (targetStatus = 1, 2 ou 5)
        const handleDrop = async (e, targetStatus) => {
            const ticketId = e.dataTransfer.getData('ticketId');
            
            // Trouver le ticket concerné dans le state local
            const ticketToMove = tickets.find(t => String(t.info.id) === String(ticketId));
            if (!ticketToMove) return;

            // Étape 1 : Mise à jour visuelle optimiste immédiate
            setTickets(prevTickets => 
                prevTickets.map(t => 
                    String(t.info.id) === String(ticketId) 
                        ? { ...t, info: { ...t.info, status: targetStatus } }
                        : t
                )
            );

            // Étape 2 : Création de l'objet attendu par tes fonctions (id et status à la racine)
            const ticketParam = {
                id: ticketToMove.info.id,
                status: Number(ticketToMove.info.status)
            };

            // Étape 3 : Appel de la bonne fonction selon la colonne cible
            setLoading(true);
            if (targetStatus === 1) {
                await ChangeToNouveau(ticketParam);
            } else if (targetStatus === 2) {
                await ChangeToInprogres(ticketParam);
            } else if (targetStatus === 5) {
                await ChangeToTermine(ticketParam);
            }
            
            // Étape 4 : Rechargement propre pour synchroniser les assignations et solutions GLPI
            await loadData();
        };

        const [tenygasy, setTenygasy] = useState(false)
        const handleChangeLangue = () => {
            setTenygasy(!tenygasy)
        }

        return (
            <div className='min-vh-100 bg-light'>
                <Header />

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
                            <h1 className="fw-bold m-0 text-secondary">Apprentissage Kanban</h1>
                            <p className="text-muted small mb-0">Version simplifiée à colonnes statiques SQLite.</p>
                        </div>
                        <div>
                            <LangueSwitch
                                label={tenygasy ? "Gasy" : "Original"} 
                                isChecked={tenygasy} 
                                onToggle={handleChangeLangue} 
                            />
                        </div>
                        {error && <div className="alert alert-danger py-2 px-3 mb-0 small">{error}</div>}
                    </div>

                    {/* CONTENEUR DE COLONNES (Centré avec justify-content-center) */}
                    <div className="d-flex gap-3 justify-content-center align-items-start" style={{ minHeight: "calc(100vh - 180px)" }}>
                        
                        {/* COLONNE 1 : NOUVEAU (Status 1) */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 1)}
                            className="rounded-4 p-3 shadow-sm border border-secondary-subtle d-flex flex-column"
                            style={{ flex: "0 0 320px", minHeight: "500px", backgroundColor: "#CFE8FF" }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
                                <h6 className="text-uppercase fw-bold pb-2 border-bottom text-dark small">
                                    🔵 {!tenygasy ? states?.[0]?.name : states?.[0]?.gasy_name}
                                </h6>
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 small">
                                    {tickets_1?.length || 0}
                                </span>
                            </div>
                            
                            <div className="d-flex flex-column gap-2 flex-grow-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                                {tickets_1?.map((ticket) => (
                                    <div
                                        key={ticket.info.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.info.id)}
                                        onClick={() => setSelectedTicket(ticket)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ticketModal"
                                        className="card border-0 shadow-sm p-2 bg-white"
                                        style={{ cursor: 'grab', transition: 'transform 0.15s ease' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge bg-secondary-subtle text-secondary rounded-pill small">
                                                Ticket #{ticket.info.id}
                                            </span>
                                            <span className="badge rounded-pill bg-light border text-dark" style={{ fontSize: "0.75rem" }}>
                                                {getTypeName(ticket.info.type)}
                                            </span>
                                        </div>

                                        <h6 className="fw-bold text-dark mb-2 text-truncate"  title={ticket.info.name}>
                                            {ticket.info.name}
                                        </h6>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-2 border-top border-light">
                                <a 
                                    href="/myglpi/tickets/create" 
                                    className="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1"
                                >
                                    <i className="bi bi-plus-circle"></i> Ajouter 1 ticket
                                </a>
                            </div>
                        </div>

                        {/* COLONNE 2 : IN PROGRESS (Status 2) */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 2)}
                            className="rounded-4 p-3 shadow-sm border border-secondary-subtle d-flex flex-column"
                            style={{ flex: "0 0 320px", minHeight: "500px", backgroundColor: "#FFE6C7" }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
                                <h6 className="text-uppercase fw-bold pb-2 border-bottom text-dark small">
                                    🟠 {!tenygasy ? states?.[1]?.name : states?.[1]?.gasy_name}
                                </h6>
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 small">
                                    {tickets_2?.length || 0}
                                </span>
                            </div>
                            <div className="d-flex flex-column gap-2 flex-grow-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                                {tickets_2?.map((ticket) => (
                                    <div
                                        key={ticket.info.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.info.id)}
                                        onClick={() => setSelectedTicket(ticket)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ticketModal"
                                        className="card border-0 shadow-sm p-2 bg-white"
                                        style={{ cursor: 'grab', transition: 'transform 0.15s ease' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge bg-secondary-subtle text-secondary rounded-pill small">
                                                Ticket #{ticket.info.id}
                                            </span>
                                            <span className="badge rounded-pill bg-light border text-dark" style={{ fontSize: "0.75rem" }}>
                                                {getTypeName(ticket.info.type)}
                                            </span>
                                        </div>

                                        <h6 className="fw-bold text-dark mb-2 text-truncate" title={ticket.info.name}>
                                            {ticket.info.name}
                                        </h6>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* COLONNE 3 : TERMINÉ (Status 5 ou 6) */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 5)}
                            className="rounded-4 p-3 shadow-sm border border-secondary-subtle d-flex flex-column"
                            style={{ flex: "0 0 320px", minHeight: "500px", backgroundColor: "#DFF4DF" }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
                                <h6 className="text-uppercase fw-bold pb-2 border-bottom text-dark small">
                                    🟢 {!tenygasy ? states?.[2]?.name : states?.[2]?.gasy_name}
                                </h6>
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 small">
                                    {tickets_3?.length || 0}
                                </span>
                            </div>
                            <div className="d-flex flex-column gap-2 flex-grow-1 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                                {tickets_3?.map((ticket) => (
                                    <div
                                        key={ticket.info.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.info.id)}
                                        onClick={() => setSelectedTicket(ticket)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ticketModal"
                                        className="card border-0 shadow-sm p-2 bg-white"
                                        style={{ cursor: 'grab', transition: 'transform 0.15s ease' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge bg-secondary-subtle text-secondary rounded-pill small">
                                                Ticket #{ticket.info.id}
                                            </span>
                                            <span className="badge rounded-pill bg-light border text-dark" style={{ fontSize: "0.75rem" }}>
                                                {getTypeName(ticket.info.type)}
                                            </span>
                                        </div>

                                        <h6 className="fw-bold text-dark mb-2 text-truncate" title={ticket.info.name}>
                                            {ticket.info.name}
                                        </h6>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Modal de détails */}
                <ModalTicket selectedTicket={selectedTicket} /> 
            </div>
        );
    }