import { getPriorityName, getStatusName, getTypeName } from "../../../services/tickets/TicketService";

export default function ModalTicket({ selectedTicket, handleReset }) {
    // La modale reste TOUJOURS dans le DOM pour Bootstrap.
    // Si aucun ticket n'est sélectionné, on cache simplement le contenu pour éviter les crashs.
    const hasData = !!selectedTicket;
    const totalCosts = selectedTicket?.costs.reduce((sum, cost) => sum + cost.totalCost,0);
    const totalDuration = selectedTicket?.costs.reduce((sum, cost) => sum + cost.durationMinutes,0);

    return (
        <div className="modal fade" id="ticketModal" tabIndex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
            {/* AJOUT de modal-dialog-scrollable pour le scroll interne */}
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4 text-dark">
                    
                    {/* Header stylisé */}
                    <div className="modal-header border-bottom-0 bg-light rounded-top-4 px-4 py-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="ticketModalLabel">
                            <i className="bi bi-ticket-perforated text-secondary"></i>
                            Fiche Ticket {hasData ? `#${selectedTicket.info.id}` : ""}
                        </h5>
                        <button type="button" onClick={handleReset} className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    {/* Corps avec hauteur max et défilement */}
                    <div className="modal-body p-4">
                        {hasData ? (
                            <div className="d-flex flex-column gap-4">
                                
                                {/* Section Principale : Titre & Description */}
                                <div>
                                    <h6 className="text-muted text-uppercase tracking-wider small fw-bold mb-2">Détails du problème</h6>
                                    <h4 className="fw-bold text-dark mb-3">{selectedTicket.info.name}</h4>
                                    <div className="p-3 bg-light rounded-3 text-secondary border-start border-3 border-secondary" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                                        {selectedTicket.info.content || "Aucune description fournie."}
                                    </div>
                                </div>

                                {/* Section Métadonnées : Type, Statut, Priorité, Date */}
                                <div className="row g-3 bg-light p-3 rounded-3 mx-0 border">
                                    <div className="col-sm-6 col-md-3">
                                        <h6 className="text-muted small fw-bold mb-1">Type</h6>
                                        <span className="badge rounded-pill bg-white text-dark border px-2 py-1.5 w-100 text-center">
                                            {getTypeName(selectedTicket.info.type)}
                                        </span>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <h6 className="text-muted small fw-bold mb-1">Statut</h6>
                                        <span className={`badge rounded-pill px-2 py-1.5 w-100 text-center ${
                                            getStatusName(selectedTicket.info.status) === 'Nouveau' ? 'bg-primary' :
                                            getStatusName(selectedTicket.info.status) === 'Solved' ? 'bg-success' : 'bg-warning text-dark'
                                        }`}>
                                            {getStatusName(selectedTicket.info.status)}
                                        </span>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <h6 className="text-muted small fw-bold mb-1">Priorité</h6>
                                        <p className="mb-0 fw-semibold text-dark text-center bg-white border rounded-pill py-1 small">
                                            {getPriorityName(selectedTicket.info.priority)}
                                        </p>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <h6 className="text-muted small fw-bold mb-1">Date de création</h6>
                                        <p className="mb-0 fw-medium text-muted text-center pt-1 small">
                                            <i className="bi bi-calendar3 me-1"></i> {selectedTicket.info.date}
                                        </p>
                                    </div>
                                </div>

                                {/* Demandeur */}
                                <div className="d-flex align-items-center gap-3 p-2 border-bottom pb-3">
                                    <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                                        <i className="bi bi-person fs-4 text-secondary"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted small mb-0 fw-bold">Demandeur</h6>
                                        <p className="fw-semibold text-dark mb-0">
                                            {selectedTicket.requester ? `${selectedTicket.requester.name}` : "Non assigné"}
                                        </p>
                                    </div>
                                </div>

                                {/* Elements associés */}
                                <div className="mt-2">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                        <i className="bi bi-box"></i> Elements
                                    </h5>
                                    {selectedTicket.elements?.length > 0 ? (
                                        <div className="table-responsive border rounded-3">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light text-muted small uppercase">
                                                    <tr>
                                                        <th className="px-3">Type</th>
                                                        <th className="px-3">Nom</th>
                                                        <th className="text-end px-3">Numero de serie</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedTicket.elements.map(elem => (
                                                        <tr key={elem.id}>
                                                            <td className="fw-medium px-3 text-secondary">{elem.itemtype}</td>
                                                            <td className="fw-medium px-3 text-secondary">{elem.name}</td>
                                                            <td className="text-end fw-bold px-3 text-dark">{elem.serial}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-light rounded-3 text-center border text-muted small">
                                            Aucun elements associés pour ce ticket.
                                        </div>
                                    )}
                                </div>
                                
                                {/* Historique des statuts style Timeline épurée */}
                                <div>
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                        <i className="bi bi-clock-history"></i> Historique des statuts
                                    </h5>
                                    {selectedTicket.statusHistory?.length > 0 ? (
                                        <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                                            {selectedTicket.statusHistory.map((history, index) => (
                                                <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2.5 px-3">
                                                    <span className="fw-medium text-dark">
                                                        <i className="bi bi-arrow-right-short text-primary me-1"></i>
                                                        {getStatusName(history.newStatus)}
                                                    </span>
                                                    <small className="text-muted font-monospace small">
                                                        {history.date}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted small italic ps-2">Aucun changement de statut enregistré.</p>
                                    )}
                                </div>

                                {/* Les coûts */}
                                <div className="mt-2">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                        <i className="bi bi-currency-dollar"></i> Suivi des coûts
                                    </h5>
                                    {selectedTicket.costs?.length > 0 ? (
                                        <div className="table-responsive border rounded-3">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light text-muted small uppercase">
                                                    <tr>
                                                        <th className="px-3">Libellé</th>
                                                        <th className="px-3">Durée</th>
                                                        <th className="text-end px-3">Sous-total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedTicket.costs.map(cost => (
                                                        <tr key={cost.id}>
                                                            <td className="fw-medium px-3 text-secondary">{cost.name}</td>
                                                            <td className="fw-medium px-3 text-secondary">{cost.durationMinutes} min</td>
                                                            <td className="text-end fw-bold px-3 text-dark">{cost.totalCost.toLocaleString()} €</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td></td>
                                                        <td className="fw-medium px-3 text-secondary">Total : {totalDuration} min</td>
                                                        <td className="text-end fw-bold px-3 text-dark">Total : {totalCosts.toLocaleString()} €</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-light rounded-3 text-center border text-muted small">
                                            Aucun coût financier enregistré pour ce ticket.
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">Initialisation des données...</div>
                        )}
                    </div>

                    {/* Footer épuré */}
                    <div className="modal-footer border-top-0 px-4 py-3 bg-light rounded-bottom-4">
                        <button type="button" onClick={handleReset} className="btn btn-secondary rounded-pill px-4 shadow-sm" data-bs-dismiss="modal">
                            Fermer la fiche
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}