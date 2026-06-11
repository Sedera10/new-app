import { useEffect, useState } from "react";
import { Modal } from "bootstrap";
import { getItems, updateItem } from "../../../services/api";

export default function FormModal({
    destined,
    pendingTicketForAssign,
    onClose,
    onAssigned,
}) {
    const ticketForAction = pendingTicketForAssign?.ticket;
    const idTicket = ticketForAction?.info?.id ?? ticketForAction?.id;
    const hasData = !!idTicket;
    const targetStatus = Number(pendingTicketForAssign?.targetStatus ?? destined);

    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(4);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        let mounted = true;

        const loadUsers = async () => {
            try {
                setFormError("");

                const data = await getItems("User", { range: "0-100" });
                if (!mounted) return;

                setUsers(Array.isArray(data) ? data : []);

                const currentAssignee = Number(
                    ticketForAction?.info?._users_id_assign ?? ticketForAction?._users_id_assign
                );

                setSelected(currentAssignee > 0 ? currentAssignee : Number(data?.[0]?.id) || 4);
            } catch (error) {
                if (mounted) {
                    setFormError(error.message || "Erreur lors du chargement des techniciens.");
                }
            }
        };

        if (hasData) {
            loadUsers();
        }

        return () => {
            mounted = false;
        };
    }, [hasData, ticketForAction]);

    useEffect(() => {
        const modalElement = document.getElementById("formModal");
        if (!modalElement) return;

        const handleHidden = () => {
            if (typeof onClose === "function") {
                onClose();
            }
        };

        modalElement.addEventListener("hidden.bs.modal", handleHidden);

        return () => {
            modalElement.removeEventListener("hidden.bs.modal", handleHidden);
        };
    }, [onClose]);

    useEffect(() => {
        if (!hasData) return;

        const modalElement = document.getElementById("formModal");
        if (!modalElement) {
            console.warn("FormModal: élément modal introuvable");
            return;
        }

        Modal.getOrCreateInstance(modalElement).show();
    }, [hasData, idTicket, targetStatus]);

    const closeFormModal = () => {
        const modalElement = document.getElementById("formModal");
        const modalInstance = modalElement ? Modal.getInstance(modalElement) : null;

        if (modalInstance) {
            modalInstance.hide();
        } else if (typeof onClose === "function") {
            onClose();
        }
    };

    const handleSubmit = async () => {
        if (!hasData || submitting) return;

        setSubmitting(true);
        setFormError("");

        try {
            await updateItem("Ticket", idTicket, {
                status: targetStatus,
                _users_id_assign: selected,
            });

            closeFormModal();

            if (typeof onAssigned === "function") {
                onAssigned();
            }
        } catch (error) {
            setFormError(error.message || "Erreur lors du changement de statut.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade" id="formModal" tabIndex="-1" aria-labelledby="formModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4 text-dark">
                    <div className="modal-header border-bottom-0 bg-light rounded-top-4 px-4 py-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="formModalLabel">
                            <i className="bi bi-person-badge text-secondary"></i>
                            Changement de statut de Ticket {hasData ? `#${idTicket}` : ""}
                        </h5>
                        <button type="button" className="btn-close shadow-none" aria-label="Close" onClick={closeFormModal}></button>
                    </div>

                    <div className="modal-body p-4">
                        {hasData ? (
                            <div className="d-flex flex-column gap-4">
                                <div className="alert alert-info mb-0 small">
                                    Vous déplacez ce ticket vers le statut <strong>{targetStatus === 6 ? "Clos / Terminé" : "En cours"}</strong>. Veuillez confirmer le technicien responsable.
                                </div>

                                {formError && (
                                    <div className="alert alert-danger mb-0 small">
                                        {formError}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label fw-semibold">Technicien assigné</label>
                                    <select
                                        id="role"
                                        className="form-select"
                                        value={selected}
                                        onChange={(event) => setSelected(Number(event.target.value))}
                                        disabled={submitting}
                                    >
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">Initialisation des données...</div>
                        )}
                    </div>

                    <div className="modal-footer border-top-0 px-4 py-3 bg-light rounded-bottom-4">
                        <button
                            type="button"
                            className="btn btn-secondary rounded-pill px-4 shadow-sm"
                            onClick={closeFormModal}
                            disabled={submitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 shadow-sm"
                            onClick={handleSubmit}
                            disabled={submitting || !hasData || users.length === 0}
                        >
                            {submitting ? "Traitement GLPI..." : "Confirmer la mise à jour"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
