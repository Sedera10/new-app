import { useState } from "react";
import { resetAllData, getResourcesToWipe } from "../../services/resetdata/resetService";
import ConfirmDialog from "../../assets/components/UI/ConfirmDialog";
import CircularProgress from "../../assets/components/UI/CircularProgress";
import { initSession } from "../../services/api";

export default function ResetPage() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [completedItems, setCompletedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const resources = getResourcesToWipe();
  
  const handleProgress = (resource, status, completed, extra = {}) => {
    if (Number.isFinite(completed)) {
      setCompletedItems(completed);
    }
    if (Number.isFinite(extra.totalItems)) {
      setTotalItems(extra.totalItems);
    }

    setSteps(prev => {
      const index = prev.findIndex(s => s.resource === resource);
      const entry = { resource, status, completed, ...extra };

      if (index >= 0) {
        const updated = [...prev];
        updated[index] = entry;
        return updated;
      }

      return [...prev, entry];
    });
  };

  const handleReset = async () => {
    setLoading(true);
    setDone(false);
    setConfirm(false)
    setSteps([]);
    setCompletedItems(0);
    setTotalItems(0);

    try {
      await initSession("glpi", "glpi");
      await resetAllData(resources, handleProgress);
      setDone(true);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const current = steps.find(s => s.status === "loading");
  const lastMessage = current?.message || (done ? "Terminé !" : "");
  const hasStarted = loading || done || steps.length > 0;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", padding: "2rem", backgroundColor: "var(--bg-body, #f8f9fa)" }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h1 className="m-0 fs-2 fw-bold text-center text-secondary">Réinitialisation GLPI</h1>
        <button 
          className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: "36px", height: "36px", border: "1px solid #ddd" }}
          onClick={() => window.location.reload()}
          title="Rafraîchir la page"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="card shadow-sm p-4 w-100 border-0 rounded-4" style={{ maxWidth: "600px", backgroundColor: "var(--bg-main, #ffffff)" }}>
        {!hasStarted ? (
          <div className="d-flex flex-column align-items-center text-center">
            {/* Encart d'avertissement moderne */}
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger w-100 py-3 px-4 rounded-3 mb-4 d-flex align-items-center gap-3 text-start">
              <i className="bi bi-exclamation-triangle-fill fs-3 flex-shrink-0"></i>
              <div>
                <h6 className="fw-bold m-0">Attention, action critique</h6>
                <small className="small opacity-75">Les données GLPI listées ci-dessous seront définitivement effacées.</small>
              </div>
            </div>
            
            <div className="w-100 mb-4">
              <h6 className="text-muted text-uppercase fw-bold small mb-3">Ressources à supprimer</h6>
              <div className="row g-2">
                {resources.map(resource => (
                  <div key={resource} className="col-6 col-md-3">
                    <div className="d-flex align-items-center gap-2 h-100 rounded-3 border bg-light bg-opacity-50 px-3 py-2">
                      <i className="bi bi-trash3 text-danger flex-shrink-0"></i>
                      <span className="fw-medium text-dark text-truncate small" title={resource}>{resource}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-lg btn-danger px-4 py-3 fw-bold d-flex align-items-center gap-3 shadow-sm border-0 rounded-3 w-100 justify-content-center" 
              onClick={() => setConfirm(true)} 
              disabled={loading}
            >
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              Lancer la réinitialisation
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center">
            <CircularProgress
                percent={progressPercent}
                currentStep={current ? lastMessage : done ? "Terminé !" : ""}
                size={220}
            />

            {/* Détail par ressource */}
            {steps.length > 0 && (
              <ul className="list-group list-group-flush w-100 mt-4 gap-1">
                {steps.map(step => (
                  <li key={step.resource} className="list-group-item border-0 bg-light bg-opacity-50 rounded-3 py-2 px-3 d-flex justify-content-between align-items-center overflow-hidden">
                    <span className="fw-medium text-dark text-truncate pe-2" style={{ maxWidth: "60%" }} title={step.resource}>
                      {step.resource}
                    </span>
                    <span className="flex-shrink-0">
                      {step.status === "loading" && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold small"><i className="bi bi-hourglass-split me-1"></i> En cours</span>}
                      {step.status === "done" && <span className="badge bg-success px-3 py-2 rounded-pill fw-bold small"><i className="bi bi-check-circle me-1"></i> {step.deletedCount} supprimé(s)</span>}
                      {step.status === "error" && <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold small"><i className="bi bi-x-circle me-1"></i> Erreur</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {done && (
              <div className="alert alert-success mt-4 w-100 text-center d-flex flex-column align-items-center border-0 rounded-3 py-3 bg-success bg-opacity-10 text-success">
                <i className="bi bi-check-circle-fill fs-2 mb-2"></i>
                <strong className="fs-6">Réinitialisation terminée avec succès !</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog 
          isOpen={confirm} 
          title="Attention, Action Irréversible" 
          message="Êtes-vous sûr de vouloir tout supprimer ? Cette action effacera toutes les ressources listées." 
          confirmText="Oui, tout supprimer" 
          cancelText="Annuler"  
          type="danger"
          onCancel={() => setConfirm(false)}
          onConfirm={handleReset}
      />
    </div>
  );
}