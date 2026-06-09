import { useState } from "react";
import { initSession } from "../../services/api";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../assets/components/UI/ConfirmDialog";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "glpi", password: "glpi" });
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = await initSession(credentials.username, credentials.password);
      if (auth) {
        navigate("/myglpi/admin/dashboard");
      } else {
        setErrorDialog({ isOpen: true, message: "Identifiants incorrects ou problème de connexion." });
      }
    } catch (error) {
      setErrorDialog({ isOpen: true, message: error.message || "Impossible de se connecter au serveur." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #000000 0%, #6D8196 100%)" 
      }}
    >
      <div 
        className="card shadow-lg border-0" 
        style={{ 
          width: "100%", 
          maxWidth: "420px", 
          backgroundColor: "#FFFFFF", 
          borderRadius: "16px" 
        }}
      >
        <div className="card-body p-5">
          
          <div className="text-center mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" 
              style={{ 
                width: "65px", 
                height: "65px", 
                borderRadius: "50%", 
                backgroundColor: "var(--bg-btn-primary)",
                color: "var(--text-btn-primary)"
              }}
            >
              <i className="bi bi-person-fill-lock fs-2"></i>
            </div>
            <h3 className="fw-bold" style={{ color: "var(--text-primary)" }}>My Own GLPI</h3>
            <p className="text-secondary small">Veuillez vous connecter à votre compte</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium text-secondary small mb-1">Identifiant</label>
              <div 
                className="input-group input-group-lg border rounded-3 overflow-hidden focus-ring-primary"
                style={{ backgroundColor: "#F8F9FA" }}
              >
                <span className="input-group-text bg-transparent border-0 text-secondary">
                  <i className="bi bi-person"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-0 shadow-none bg-transparent" 
                  style={{ fontSize: "0.9rem" }}
                  placeholder="Saisissez votre identifiant"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium text-secondary small mb-1">Mot de passe</label>
              <div 
                className="input-group input-group-lg border rounded-3 overflow-hidden"
                style={{ backgroundColor: "#F8F9FA" }}
              >
                <span className="input-group-text bg-transparent border-0 text-secondary">
                  <i className="bi bi-shield-lock"></i>
                </span>
                <input 
                  type="password" 
                  className="form-control border-0 shadow-none bg-transparent" 
                  style={{ fontSize: "0.9rem" }}
                  placeholder="Saisissez votre mot de passe"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center"
              style={{ 
                backgroundColor: "var(--bg-btn-primary)", 
                color: "var(--text-btn-primary)", 
                transition: "all 0.2s" 
              }}
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Connexion <i className="bi bi-box-arrow-in-right ms-2 fs-5"></i>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      <ConfirmDialog 
        isOpen={errorDialog.isOpen} 
        title="Erreur de connexion" 
        message={errorDialog.message} 
        confirmText="Réessayer" 
        cancelText="Fermer"  
        type="danger"
        onCancel={() => setErrorDialog({ isOpen: false, message: "" })}
        onConfirm={() => setErrorDialog({ isOpen: false, message: "" })}
      />
    </div>
  );
}