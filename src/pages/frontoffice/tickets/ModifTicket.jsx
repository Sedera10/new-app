import { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../../../services/api";
import { CountElements, getElementItems, ListeElements } from "../../../services/elements/ElementService";
import { DetailsTicket, MapToTableau } from "../../../services/tickets/TicketService";
import { STATUS_MAP, PRIORITY_MAP } from "../../../services/imports/file2/helper";
import { normalizeNumber } from "../../../services/imports/Global";
import ConfirmDialog from "../../../assets/components/UI/ConfirmDialog";
import Header from "../Header";
import { useParams } from "react-router-dom";

export default function ModifTicket() {
    const { id } = useParams();
    const [ticket, setTicket] = useState();

    const [title, setTitle] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [elements, setElements] = useState([]);
    const [type, setType] = useState(1);
    const [status, setStatus] = useState(1);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(3);
    const [selectedElements, setSelectedElements] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearch, setUserSearch] = useState("");
    const [elementSearch, setElementSearch] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmType, setConfirmType] = useState("success");

    const states = MapToTableau(STATUS_MAP);
    const priorities = MapToTableau(PRIORITY_MAP);

    const toGLPINumber = (value) => Number(value);

    const formatGLPIDate = (value) => {
        if (!value) return undefined;
        const [datePart, timePart = "00:00"] = value.split("T");
        return `${datePart} ${timePart}:00`;
    };

    const getCurrentGLPIDate = () => {
        const now = new Date();
        const pad = (number) => String(number).padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
    };

    const syncFormFromTicket = (ticketdata) => {
        setTitle(ticketdata?.info?.name || "");
        setType(ticketdata?.info?.type ?? 1);
        setStatus(ticketdata?.info?.status ?? 1);
        setPriority(ticketdata?.info?.priority ?? 3);
        setDescription(ticketdata?.info?.content || "");
        setDateTime(ticketdata?.info?.date || "");
        setSelectedUser(ticketdata?.requester || null);
        setUserSearch(ticketdata?.requester?.name || "");
        setSelectedElements((ticketdata?.elements || []).map(el => el.id));
        setElementSearch("");
    };

    const handleToggleElement = (elId) => {
        if (selectedElements.includes(elId)) {
            setSelectedElements(selectedElements.filter(id => id !== elId));
        } else {
            setSelectedElements([...selectedElements, elId]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const ticketdata = await DetailsTicket(normalizeNumber(id));
                setTicket(ticketdata);
                syncFormFromTicket(ticketdata);
                const items = await ListeElements();
                setElements(items);
                const usersData = await getItems("User");
                setUsers(usersData);
            } catch (error) {
                console.log("Erreur de chargement des donnees : ", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        
    }, [id]);
    console.log("Taille elements : ", elements.length)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Bloquer la soumission si l'API est déjà en cours de chargement
        if (loading) return;

        const ticketPayload = {
            name: title,
            content: description,
            type: toGLPINumber(type),
            status: toGLPINumber(status),
            priority: toGLPINumber(priority),
            date: formatGLPIDate(dateTime) || getCurrentGLPIDate(),
        };
        
        try {
            setLoading(true);
            const updatedTicket = await updateItem("Ticket", normalizeNumber(id), ticketPayload);

            const previousRequesterId = ticket?.requester?.id ? normalizeNumber(ticket.requester.id) : null;
            const nextRequesterId = selectedUser ? normalizeNumber(selectedUser.id) : null;

            // Mise à jour du demandeur uniquement si la valeur change
            if (previousRequesterId !== nextRequesterId) {
                if (previousRequesterId) {
                    const idTicketUser = await getItem(`Ticket/${normalizeNumber(id)}/Ticket_User`, previousRequesterId, {
                        input: {
                            tickets_id: normalizeNumber(id),
                            users_id: previousRequesterId,
                            type: 1,
                        },
                    });
                    await deleteItem(`Ticket_User`, idTicketUser?.id);
                }

                if (nextRequesterId) {
                    await updateItem(`Ticket`,normalizeNumber(id), {
                        _users_id_requester: nextRequesterId
                    });
                }
            }

            // Mise à jour des éléments associés uniquement si la sélection change
            const previousElementIds = (ticket?.elements || []).map(el => normalizeNumber(el.id)).sort();
            const nextElementIds = [...new Set(selectedElements.map(el => normalizeNumber(el)))].sort();
            const elementsChanged =
                previousElementIds.length !== nextElementIds.length ||
                previousElementIds.some((idValue, index) => idValue !== nextElementIds[index]);

            if (elementsChanged) {
                const currentItemTickets = await getItems(`Ticket/${normalizeNumber(id)}/Item_Ticket`);
                for (const itemTicket of currentItemTickets) {
                    await deleteItem(`Ticket/${normalizeNumber(id)}/Item_Ticket`, itemTicket.id, {
                        input: itemTicket,
                    });
                }

                for (const elId of nextElementIds) {
                    const el = elements.find(item => normalizeNumber(item.id) === elId);
                    if (el) {
                        await createItem(`Ticket/${normalizeNumber(id)}/Item_Ticket`, {
                            itemtype: el.itemtype,
                            items_id: elId,
                        });
                    }
                }
            }

            setTicket({
                ...ticket,
                info: {
                    ...ticket?.info,
                    ...updatedTicket,
                    name: title,
                    content: description,
                    type: toGLPINumber(type),
                    status: toGLPINumber(status),
                    priority: toGLPINumber(priority),
                    date: formatGLPIDate(dateTime) || getCurrentGLPIDate(),
                },
                requester: selectedUser,
                elements: nextElementIds.map(elId => {
                    const el = elements.find(item => normalizeNumber(item.id) === elId);
                    return el ? {
                        id: elId,
                        itemtype: el.itemtype,
                        name: el.name,
                        serial: el.serial,
                    } : null;
                }).filter(Boolean),
            });

            setConfirmMessage("Ticket modifié avec succès !");
            setConfirmType("success");
            setShowConfirm(true);
        } catch (err) {
            console.error("Erreur lors de la modification du ticket", err);
            setConfirmMessage("Erreur lors de la modification du ticket.");
            setConfirmType("danger");
            setShowConfirm(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light">
            
            {/* ================= HEADER FRONT-OFFICE ================= */}
            <Header/>

            {/* ================= CONTENU PRINCIPAL ================= */}
            <div className="container py-5" style={{ maxWidth: "1000px" }}>
                <div className="mb-4">
                    <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Modifier un Ticket</h1>
                    <p className="text-muted small">Veuillez renseigner les détails ci-dessous pour ouvrir un nouvel incident ou une demande.</p>
                </div>

                <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "var(--bg-card)" }}>
                    <form onSubmit={handleSubmit}>
                        
                        {/* LIGNE 1 : TITRE & DESCRIPTION */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Titre du ticket *</label>
                                <input 
                                    type="text" 
                                    className="form-control border-secondary-subtle py-2 shadow-none" 
                                    placeholder="Ex: Problème d'accès à internet" 
                                    value={ticket?.info.name}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Description détaillée</label>
                                <textarea 
                                    className="form-control border-secondary-subtle py-2 shadow-none" 
                                    rows="1" 
                                    style={{ minHeight: "40px" }}
                                    placeholder="Décrivez votre problème ou demande..."
                                    value={ticket?.info.content}
                                    onChange={e => setDescription(e.target.value)}
                                    disabled={loading}
                                ></textarea>
                            </div>
                        </div>

                        {/* LIGNE 2 : TYPE, STATUS, PRIORITY, DATE */}
                        <div className="row g-3 mb-4 p-3 rounded-3" style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Type de demande *</label>
                                <select className="form-select border-secondary-subtle shadow-none" value={ticket?.info.type} onChange={e => setType(e.target.value)} required disabled={loading}>
                                    <option value={normalizeNumber("1")}>Incident</option>
                                    <option value={normalizeNumber("2")}>Demande</option>
                                </select>
                            </div>
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Statut</label>
                                <select className="form-select border-secondary-subtle shadow-none" value={ticket?.info.status} onChange={e => setStatus(e.target.value)} required disabled={loading}>
                                    {states.map(([label, value], index) => (
                                        <option key={`${value}-${index}`} value={value}>{value} - {label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Priorité</label>
                                <select className="form-select border-secondary-subtle shadow-none" value={ticket?.info.priority} onChange={e => setPriority(e.target.value)} required disabled={loading}>
                                    {priorities.map(([label, value], index) => (
                                        <option key={`${value}-${index}`} value={value}>{value} - {label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label fw-semibold text-secondary small text-uppercase">Date / Heure (optionnel)</label>
                                <input
                                    type="datetime-local"
                                    className="form-control border-secondary-subtle shadow-none"
                                    value={ticket?.info.date}
                                    onChange={e => setDateTime(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* LIGNE 3 : UTILISATEUR */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold text-secondary small text-uppercase">Utilisateur concerné</label>
                            <div className="input-group mb-2">
                                <span className="input-group-text bg-white border-secondary-subtle text-muted"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-secondary-subtle border-start-0 shadow-none"
                                    placeholder="Rechercher un utilisateur par son nom..."
                                    value={ticket?.requester?.name}
                                    onChange={e => setUserSearch(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {users.filter(u => !userSearch || (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))).length > 0 && (
                                <div className="row g-2 max-vh-25 overflow-y-auto pt-1">
                                    {users
                                        .filter(u => !userSearch || (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())))
                                        .map(u => {
                                            const isSel = selectedUser?.id === u.id;
                                            return (
                                                <div className="col-sm-6 col-md-4" key={u.id}>
                                                    <div
                                                        className="p-2.5 px-2 border rounded-3 text-start h-100 d-flex align-items-center justify-content-between"
                                                        style={{
                                                            cursor: loading ? "not-allowed" : "pointer",
                                                            backgroundColor: isSel ? "var(--bg-btn-primary)" : "#FFFFFF",
                                                            color: isSel ? "#FFFFFF" : "var(--text-primary)",
                                                            borderColor: isSel ? "var(--bg-btn-primary)" : "#dee2e6",
                                                            pointerEvents: loading ? "none" : "auto",
                                                            transition: "all 0.15s ease"
                                                        }}
                                                        onClick={() => !loading && setSelectedUser(isSel ? null : u)}
                                                    >
                                                        <span className="small fw-medium text-truncate me-2"><i className="bi bi-person me-1.5"></i>{u.name}</span>
                                                        {isSel ? (
                                                            <i className="bi bi-check-circle-fill text-white small"></i>
                                                        ) : (
                                                            <i className="bi bi-circle text-muted small"></i>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        {/* LIGNE 4 : ELEMENTS */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold text-secondary small text-uppercase">Associer des éléments du parc (Optionnel)</label>
                            <div className="input-group mb-2">
                                <span className="input-group-text bg-white border-secondary-subtle text-muted"><i className="bi bi-cpu"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-secondary-subtle border-start-0 shadow-none"
                                    placeholder="Rechercher par nom, modèle ou type d'équipement matériel..."
                                    value={ticket?.elements?.name}
                                    onChange={e => setElementSearch(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="row g-2">
                                {(elementSearch ? elements.filter(el => {
                                    const term = elementSearch.toLowerCase();
                                    return (
                                        (el.name && el.name.toLowerCase().includes(term)) ||
                                        (el.model && el.model.toLowerCase().includes(term)) ||
                                        (el.type && el.type.toLowerCase().includes(term))
                                    );
                                }) : elements.slice(0, 4)).map(el => {
                                    const isSelected = selectedElements.includes(el.id);
                                    return (
                                        <div className="col-sm-6 col-md-3" key={el.id}>
                                            <div 
                                                className="p-2.5 border px-2 rounded-3 text-start bg-white h-100 d-flex align-items-center justify-content-between"
                                                style={{ 
                                                    cursor: loading ? "not-allowed" : "pointer", 
                                                    borderColor: isSelected ? "var(--bg-btn-primary)" : "#dee2e6",
                                                    borderWidth: isSelected ? "2px" : "1px",
                                                    boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                                                    pointerEvents: loading ? "none" : "auto",
                                                    transition: "all 0.15s ease"
                                                }}
                                                onClick={() => !loading && handleToggleElement(el.id)}
                                            >
                                                <div className="text-truncate me-2">
                                                    <div className="fw-bold small text-truncate text-dark">{el.name}</div>
                                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{el.type}{el.model ? ` - ${el.model}` : ''}</div>
                                                </div>
                                                <div>
                                                    {isSelected ? (
                                                        <i className="bi bi-check-circle-fill" style={{ color: "var(--bg-btn-primary)" }}></i>
                                                    ) : (
                                                        <i className="bi bi-circle text-muted small"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <hr className="my-4 opacity-50" />

                        {/* ACTIONS */}
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light px-4 rounded-pill border fw-medium btn-sm" disabled={loading}>
                                Annuler
                            </button>
                            {/* MODIFICATION : Ajout de disabled={loading} + Spinner de chargement */}
                            <button 
                                type="submit" 
                                className="btn px-4 rounded-pill text-white fw-semibold shadow-sm btn-sm"
                                style={{ backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-file-earmark-plus me-1.5"></i>Soumettre le ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <ConfirmDialog
                    isOpen={showConfirm}
                    title={confirmType === 'success' ? 'Succès' : 'Erreur'}
                    message={confirmMessage}
                    type={confirmType}
                    confirmText="OK"
                    cancelText="Fermer"
                    onConfirm={() => setShowConfirm(false)}
                    onCancel={() => setShowConfirm(false)}
                    isLoading={false}
                />
            </div>
        </div>
    );
}