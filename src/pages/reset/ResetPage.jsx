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
  // Met à jour ou ajoute une étape dans la liste
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
        // Mise à jour de l'étape existante (loading → done/error)
        const updated = [...prev];
        updated[index] = entry;
        return updated;
      }

      // Nouvelle étape
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

  // Calcul de la progression globale
  const progressPercent = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const current = steps.find(s => s.status === "loading");
  const hasStarted = loading || done || steps.length > 0;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", padding: "2rem" }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h1 className="m-0 fs-2 fw-bold text-center">Réinitialisation GLPI</h1>
        <button 
          className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px" }}
          onClick={() => window.location.reload()}
          title="Rafraîchir la page"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="card shadow-sm p-4 w-100 border-0" style={{ maxWidth: "600px", backgroundColor: "var(--bg-main)" }}>
        {!hasStarted ? (
          <div className="d-flex flex-column align-items-center text-center">
            <h5 className="mb-3 text-secondary">Les données suivantes seront définitivement effacées :</h5>
            
            <ul className="list-group list-group-flush w-100 mb-4" style={{ borderRadius: "8px", overflow: "hidden" }}>
              {resources.map(resource => (
                <li key={resource} className="list-group-item bg-white d-flex align-items-center">
                  <i className="bi bi-dash-circle text-danger me-3"></i>
                  {resource}
                </li>
              ))}
            </ul>

            <button 
              className="btn btn-lg btn-danger px-4 py-2 fw-bold d-flex align-items-center gap-4" 
              onClick={() => setConfirm(true)} 
              disabled={loading}
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
              Lancer la réinitialisation
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center">
            <CircularProgress
                percent={progressPercent}
                currentStep={current ? `Nettoyage de ${current.resource}...` : done ? "Terminé !" : ""}
                size={220}
            />

            {/* Détail par ressource */}
            {steps.length > 0 && (
              <ul className="list-group list-group-flush w-100 mt-4" style={{ borderRadius: "8px", overflow: "hidden" }}>
                {steps.map(step => (
                  <li key={step.resource} className="list-group-item bg-white d-flex justify-content-between align-items-center">
                    <span className="fw-medium">{step.resource}</span>
                    <span>
                      {step.status === "loading" && <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i> En cours</span>}
                      {step.status === "done" && <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i> {step.deletedCount} supprimé(s)</span>}
                      {step.status === "error" && <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i> Erreur</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {done && (
              <div className="alert alert-success mt-4 w-100 text-center d-flex flex-column align-items-center">
                <i className="bi bi-check-circle-fill fs-3 mb-2"></i>
                <strong>Réinitialisation terminée avec succès !</strong>
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