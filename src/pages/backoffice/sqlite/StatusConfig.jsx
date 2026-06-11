import React, { useState, useEffect } from 'react';
// Import reusable service functions
import { fetchStatuses, createStatus, updateStatus, deleteStatus } from '../../../services/conf/StatusService';

export default function StatusConf() {
  const [statuses, setStatuses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    gasy_name: '',
    color: '#ffffff',
    glpi_link: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Charger la liste des statuts en utilisant le service
  const loadStatuses = async () => {
    try {
      const data = await fetchStatuses();
      setStatuses(data);
    } catch (error) {
      showToast("Erreur lors de la récupération des données", "error");
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  // Gestion des notifications éphémères
  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Soumission du formulaire (Ajout ou Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateStatus(editingId, {
          ...formData,
          glpi_link: formData.glpi_link ? parseInt(formData.glpi_link, 10) : null,
        });
        showToast("Statut modifié avec succès !", "success");
      } else {
        await createStatus({
          ...formData,
          glpi_link: formData.glpi_link ? parseInt(formData.glpi_link, 10) : null,
        });
        showToast("Nouveau statut ajouté !", "success");
      }
      resetForm();
      loadStatuses();
    } catch (error) {
      showToast(error.message || "Impossible de joindre l'API.", "error");
    }
  };

  // Activer le mode édition
  const handleEdit = (status) => {
    setEditingId(status.id);
    setFormData({
      name: status.name,
      gasy_name: status.gasy_name,
      color: status.color || '#ffffff',
      glpi_link: status.glpi_link || ''
    });
  };
  const handleDelete = async (status) => {
    try {
      await deleteStatus(status.id);
      showToast('Statut supprimé avec succès !', 'success');
      // If the deleted item was being edited, reset the form
      if (editingId === status.id) {
        resetForm();
      }
      loadStatuses();
    } catch (error) {
      showToast(error.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  // Annuler la modification
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', gasy_name: '', color: '#ffffff', glpi_link: '' });
  };

  return (
    <div style={styles.container}>
        <h1 className="mb-4 fw-bold" style={{ color : "var(--text-secondary)"}}>SQLite Status</h1>
      {/* Notification */}
      {message.text && (
        <div style={{ ...styles.toast, backgroundColor: message.type === 'success' ? '#4CAF50' : '#F44336' }}>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* Colonne Formulaire (Ajout / Édition) */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId ? "Modifier le statut" : "Ajouter un statut"}
          </h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom (Standard)</label>
              <input
                type="text"
                required
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: En attente"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom en Gasy</label>
              <input
                type="text"
                required
                style={styles.input}
                value={formData.gasy_name}
                onChange={(e) => setFormData({ ...formData, gasy_name: e.target.value })}
                placeholder="Ex: Miandry"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Couleur du badge</label>
              <div style={styles.colorPickerContainer}>
                <input
                  type="color"
                  style={styles.colorInput}
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <input
                  type="text"
                  style={{ ...styles.input, flex: 1 }}
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ID de correspondance GLPI</label>
              <input
                type="number"
                style={styles.input}
                value={formData.glpi_link}
                onChange={(e) => setFormData({ ...formData, glpi_link: e.target.value })}
                placeholder="Ex: 4"
              />
            </div>

            <div style={styles.btnGroup}>
              <button type="submit" style={styles.btnPrimary}>
                {editingId ? "Enregistrer" : "Ajouter"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={styles.btnSecondary}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Colonne Liste des données */}
        <div style={{ ...styles.card, flex: 2 }}>
          <h2 style={styles.cardTitle}>Statuts Configuration ({statuses.length})</h2>
          
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Nom Gasy</th>
                  <th style={styles.th}>Aperçu Badge</th>
                  <th style={styles.th}>Lien GLPI</th>
                  <th style={{ ...styles.th, textAlign: 'right', paddingRight: '20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((status) => (
                  <tr key={status.id} style={styles.tr}>
                    <td style={styles.td}><strong>#{status.id}</strong></td>
                    <td style={styles.td}>{status.name}</td>
                    <td style={styles.td}>{status.gasy_name}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: status.color || '#E0E0E0',
                        color: '#333'
                      }}>
                        {status.name}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {status.glpi_link ? `ID ${status.glpi_link}` : '—'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center',  }}>
                      <button 
                        onClick={() => handleEdit(status)}
                        style={editingId === status.id ? styles.btnActionActive : styles.btnAction}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(status)}
                        style={editingId === status.id ? styles.btnActionActive : styles.btnAction}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {statuses.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                      Aucun statut trouvé dans la base de données.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles en JS (Look & Feel Pro / Material minimaliste)
const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  grid: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1 1 350px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    padding: '24px',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1f36',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#4f566b',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d8dee4',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  colorPickerContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  colorInput: {
    border: 'none',
    width: '40px',
    height: '40px',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
  },
  btnGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  btnPrimary: {
    backgroundColor: '#635bff',
    color: '#fff',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnSecondary: {
    backgroundColor: '#f1f3f5',
    color: '#495057',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '2px solid #edf2f7',
  },
  th: {
    padding: '12px 8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4f566b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #edf2f7',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '14px 8px',
    fontSize: '14px',
    color: '#2e384d',
    verticalAlign: 'middle',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  btnAction: {
    backgroundColor: '#fff',
    border: '1px solid #635bff',
    color: '#635bff',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  btnActionActive: {
    backgroundColor: '#635bff',
    border: '1px solid #635bff',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
  },
  toast: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1100,
    fontSize: '14px',
    fontWeight: '500',
  }
};