import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { createItem, getItems, updateItem } from '../../../services/api';
import { DetailsTicket, getTypeName } from '../../../services/tickets/TicketService';
import ModalTicket from '../../../assets/components/UI/ModalTicket';
import LangueSwitch from '../../../assets/components/UI/LangueSwitch';
import { fetchStatuses } from '../../../services/conf/StatusService';
import FormModal from '../../../assets/components/UI/FormModal'; // Plus de needsAssignee importé

export default function TicketsSimple() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [states, setStates] = useState([]);
    
    // On garde tes listes séparées
    const [tickets_1, setTickets_1] = useState([]);
    const [tickets_2, setTickets_2] = useState([]);
    const [tickets_3, setTickets_3] = useState([]);
    
    const [destinedState, setDestinedState] = useState(null);
    const [pendingTicketForAssign, setPendingTicketForAssign] = useState(null);
    const [tenygasy, setTenygasy] = useState(false);

    const showAssignModal = (ticket, targetStatus) => {
        const finalStatus = targetStatus === 5 ? 6 : targetStatus;

        setPendingTicketForAssign(null);
        setDestinedState(finalStatus);

        requestAnimationFrame(() => {
            const nextTicket = {
                ...ticket,
                info: {
                    ...ticket.info,
                    id: ticket.info.id ?? ticket.id,
                },
            };

            console.log("Ouverture FormModal :", {
                ticketId: nextTicket.info.id,
                targetStatus: finalStatus,
            });

            setPendingTicketForAssign({
                ticket: nextTicket,
                targetStatus: finalStatus,
            });
        });
    };

    // --- 🚀 OPTIMISATION MAJEURE DU CHARGEMENT ---
    const loadData = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            
            // 1 seule requête API au lieu de 50+ !
            const rawTickets = await getItems("Ticket", { range: "0-100" }); 
            const statuses = await fetchStatuses();

            // On formate les données pour respecter la structure { info: {...} } attendue par tes cartes
            const formattedTickets = (rawTickets || []).map(ticket => ({
                info: ticket 
            }));

            setTickets(formattedTickets);
            setStates(statuses);

            // Tri dans les colonnes
            setTickets_1(formattedTickets.filter(t => String(t.info.status) === '1'));
            setTickets_2(formattedTickets.filter(t => String(t.info.status) === '2'));
            setTickets_3(formattedTickets.filter(t => String(t.info.status) === '5' || String(t.info.status) === '6'));
            
        } catch (er) {
            console.error("Erreur de chargement :", er);
            setError(er.message);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const fomartTicket = async (ticket) => {
        try {
            const valiny = await DetailsTicket(ticket.info.id)
            setSelectedTicket(valiny)
        } catch (error) {
            console.log("Erreur de chargement des informations tickets")
        }
    }

    // --- FONCTION API DIRECTE (Seulement pour Nouveau) ---
    const ChangeToNouveau = async (ticketId) => {
        try {
            setError('');
            await updateItem("Ticket", ticketId, { status: 1, _users_id_assign: 0 });
        } catch (er) {
            console.log("Erreur de changement de status vers 'Nouveau' ", er);
            setError(er.message);
        }
    };

    // --- GESTION DU DRAG & DROP ---
    const handleDragStart = (e, ticketId) => {
        e.dataTransfer.setData('ticketId', ticketId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStatus) => {
        const ticketId = e.dataTransfer.getData('ticketId');
        const ticketToMove = tickets.find(t => String(t.info.id) === String(ticketId));
        
        if (!ticketToMove || Number(ticketToMove.info.status) === targetStatus) return;

        if (targetStatus === 1) {
            // Retour à Nouveau : Pas de modal, on affiche le loader et on met à jour direct
            setLoading(true);
            await ChangeToNouveau(ticketToMove.info.id);
            await loadData(false); // Recharge silencieusement
            setLoading(false);
        } else if (targetStatus === 2 || targetStatus === 6 || targetStatus === 5) {
            // Ouverture systématique du modal (On délègue l'update au FormModal)
            showAssignModal(ticketToMove, targetStatus);
        }
    };

    const handleAssigned = async () => {
        setPendingTicketForAssign(null);
        await loadData(true); // On rafraîchit la page avec le loader après succès du modal
    };

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
                        <h1 className="fw-bold m-0 text-secondary">Gestion des tickets</h1>
                        <p className="text-muted small mb-0">Version ultra-rapide (1 requête).</p>
                    </div>
                    <div>
                        <LangueSwitch
                            label={tenygasy ? "Gasy" : "Original"} 
                            isChecked={tenygasy} 
                            onToggle={() => setTenygasy(!tenygasy)} 
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2 px-3 mb-0 small">{error}</div>}
                </div>

                {/* CONTENEUR DE COLONNES */}
                <div className="d-flex gap-3 justify-content-center align-items-start" style={{ minHeight: "calc(100vh - 180px)" }}>
                    
                    {/* COLONNE 1 : NOUVEAU */}
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
                                    onClick={async () => {
                                        const details = await DetailsTicket(ticket.info.id);
                                        setSelectedTicket(details);
                                    }}
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
                        <div className="mt-3 pt-2 border-top border-light">
                            <a 
                                href="/myglpi/tickets/create" 
                                className="btn btn-sm btn-outline-secondary w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-1"
                            >
                                <i className="bi bi-plus-circle"></i> Ajouter 1 ticket
                            </a>
                        </div>
                    </div>

                    {/* COLONNE 2 : EN COURS */}
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
                                    onClick={async () => {
                                        const details = await DetailsTicket(ticket.info.id);
                                        setSelectedTicket(details);
                                    }}
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
                                    onClick={async () => {
                                        const details = await DetailsTicket(ticket.info.id);
                                        setSelectedTicket(details);
                                    }}
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

            <ModalTicket selectedTicket={selectedTicket} /> 
            
            <FormModal
                destined={destinedState}
                pendingTicketForAssign={pendingTicketForAssign}
                onClose={() => setPendingTicketForAssign(null)}
                onAssigned={handleAssigned}
            />
        </div>
    );
}