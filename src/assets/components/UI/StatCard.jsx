import './StatCard.css'

export default function StatCard({
    title,
    amount,
    footerText,
    format = 'number',
    icon
}) {
    const numericAmount = Number(amount) || 0;

    const displayValue = format === 'currency'
        ? `${numericAmount.toFixed(2)} €`
        : numericAmount.toLocaleString('fr-FR');

    return (
        <div className="stat-card border-0 shadow-sm rounded-4 p-4 h-100 position-relative overflow-hidden">
            {icon && (
                <div className="stat-icon">
                    <i className={icon}></i>
                </div>
            )}

            <div className="stat-header text-uppercase text-muted small fw-bold mb-2">{title}</div>
            <div className="stat-value fw-bolder text-dark mb-2">{displayValue}</div>
            <div className="stat-desc text-muted small m-0">{footerText}</div>
            
            {/* Ligne décorative discrète en bas de la carte */}
            <div className="stat-card-indicator position-absolute bottom-0 start-0 end-0" style={{ height: "4px" }}></div>
        </div>
    );
}