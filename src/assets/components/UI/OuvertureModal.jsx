import { useEffect, useState } from "react";
import { Modal } from "bootstrap";

export default function OuvertureModal({ pendingTicket, onClose, onConfirm }) {
    const idTicket = pendingTicket?.info?.id ?? pendingTicket?.id;

    const [percentage, setPercentage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Ouvre le modal automatiquement dès qu'un ticket est en attente de réouverture
    useEffect(() => {
        if (!idTicket) return;
        const modalElement = document.getElementById("reopenModal");
        if (modalElement) {
            Modal.getOrCreateInstance(modalElement).show();
        }
    }, [idTicket]);

    // Reset du formulaire à la fermeture ou au changement de ticket
    useEffect(() => {
        if (!idTicket) {
            setPercentage("");
            setError("");
        }
    }, [idTicket]);

    const handleClose = () => {
        const modalElement = document.getElementById("reopenModal");
        const modalInstance = modalElement ? Modal.getInstance(modalElement) : null;
        if (modalInstance) modalInstance.hide();
        if (onClose) onClose();
    };

    const handleSubmit = async () => {
        if (!idTicket || submitting) return;

        const normalizedPercentage = Number(percentage);
        if (!Number.isFinite(normalizedPercentage) || normalizedPercentage <= 0 || normalizedPercentage > 100) {
            setError("Veuillez saisir un pourcentage valide entre 1 et 100.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            // Exécute la logique de réouverture passée par le parent
            await onConfirm(normalizedPercentage);
            console.log("Pourcentage :", percentage)
            handleClose();
        } catch (err) {
            setError(err.message || "Erreur lors de l'annulation.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade" id="reopenModal" tabIndex="-1" aria-labelledby="reopenModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 text-dark">
                    <div className="modal-header border-bottom-0 bg-light rounded-top-4 px-4 py-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="reopenModalLabel">
                            <i className="bi bi-arrow-counterclockwise text-secondary"></i>
                            Annulation
                        </h5>
                        <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {error && (
                            <div className="alert alert-danger py-2 small">{error}</div>
                        )}

                        <p className="text-muted small mb-3">
                            Le dernier super-cost de ce ticket sera supprimé.
                            Le frais d'ouverture sera calculé à partir de ce dernier super-cost.
                        </p>

                        <div className="mb-3">
                            <label htmlFor="reopenPercentageInput" className="form-label fw-medium">
                                Réouverture en pourcentage (%)
                            </label>
                            <input
                                id="reopenPercentageInput"
                                type="number"
                                className="form-control"
                                value={percentage}
                                onChange={(e) => setPercentage(Number(e.target.value))}
                                min="1"
                                max="100"
                                step="0.1"
                                placeholder="Ex: 10"
                                disabled={submitting}
                                autoFocus
                            />
                        </div>

                        <div className="bg-light p-2 rounded-3 text-muted" style={{ fontSize: '0.8rem' }}>
                            <strong>Exempe :</strong> Si dernier super-cost = 95 et pourcentage = 10%, alors frais ouverture = 9.5
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 px-4 py-3 bg-light rounded-bottom-4">
                        <button
                            type="button"
                            className="btn btn-secondary rounded-pill px-4 shadow-sm"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Annuler
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 shadow-sm"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Traitement..." : "Confirmer l'annulation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}