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
        <div className="stat-card highlight my-3">
            {icon && (
                <div className="stat-icon">
                    <i className={icon}></i>
                </div>
            )}

            <div className="stat-header">{title}</div>
            <div className="stat-value">{displayValue}</div>
            <div className="stat-desc">{footerText}</div>
        </div>
    );
}