import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  type = 'warning', // 'warning', 'danger', 'success'
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  isLoading = false
}) {
  
  if (!isOpen) return null;

  // Sélectionner l'icône en fonction du type
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <i className="bi bi-x-circle confirm-icon danger"></i>;
      case 'success':
        return <i className="bi bi-check-circle confirm-icon success"></i>;
      case 'warning':
      default:
        return <i className="bi bi-exclamation-triangle confirm-icon warning"></i>;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="confirm-backdrop" onClick={onCancel}></div>

      {/* Dialog */}
      <div className="confirm-dialog">
        <div className="confirm-icon-container">
          {getIcon()}
        </div>

        <h5 className="confirm-title">{title}</h5>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {confirmText}...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </>
  );
}
