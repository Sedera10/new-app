import { useEffect, useState } from "react";
import { Modal } from "bootstrap";
import { createSuperCost } from "../../../services/conf/SuperCostService";

export default function CoutModal({ pendingTicket, onClose, onConfirm }) {
    const ticket = pendingTicket?.ticket;
    const targetStatus = pendingTicket?.targetStatus;
    const idTicket = ticket?.info?.id ?? ticket?.id;

    const [cost, setCost] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!idTicket) return;

        const modalElement = document.getElementById("coutModal");
        if (modalElement) {
            Modal.getOrCreateInstance(modalElement).show();
        }
    }, [idTicket]);

    useEffect(() => {
        if (!idTicket) {
            setCost("");
            setFormError("");
        }
    }, [idTicket]);

    const closeModal = () => {
        const modalElement = document.getElementById("coutModal");
        const modalInstance = modalElement ? Modal.getInstance(modalElement) : null;

        if (modalInstance) {
            modalInstance.hide();
        }

        if (onClose) onClose();
    };

    const handleSubmit = async () => {
        if (!idTicket || submitting) return;

        const normalizedCost = Number(cost);
        if (!Number.isFinite(normalizedCost) || normalizedCost < 0) {
            setFormError("Veuillez saisir un cout valide.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");

            await createSuperCost({ ticket_id: idTicket, cost: normalizedCost });

            if (onConfirm) {
                await onConfirm(ticket, targetStatus);
            }

            setCost("");
            closeModal();
        } catch (error) {
            setFormError(error.message || "Erreur lors du changement de statut.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade" id="coutModal" tabIndex="-1" aria-labelledby="coutModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 text-dark">
                    <div className="modal-header border-bottom-0 bg-light rounded-top-4 px-4 py-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="coutModalLabel">
                            <i className="bi bi-cash-coin text-secondary"></i>
                            Cout du ticket {idTicket ? `#${idTicket}` : ""}
                        </h5>
                        <button type="button" className="btn-close shadow-none" aria-label="Close" onClick={closeModal}></button>
                    </div>

                    <div className="modal-body p-4">
                        {formError && (
                            <div className="alert alert-danger py-2 small">{formError}</div>
                        )}

                        <label htmlFor="superCostInput" className="form-label">Cout</label>
                        <input
                            id="superCostInput"
                            type="number"
                            className="form-control"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            min="0"
                            step="0.01"
                            disabled={submitting}
                            autoFocus
                        />
                    </div>

                    <div className="modal-footer border-top-0 px-4 py-3 bg-light rounded-bottom-4">
                        <button
                            type="button"
                            className="btn btn-secondary rounded-pill px-4 shadow-sm"
                            onClick={closeModal}
                            disabled={submitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 shadow-sm"
                            onClick={handleSubmit}
                            disabled={submitting || !idTicket}
                        >
                            {submitting ? "Enregistrement..." : "Confirmer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
