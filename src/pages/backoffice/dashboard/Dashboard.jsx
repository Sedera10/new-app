import { useState, useEffect } from "react";
import StatCard from "../../../assets/components/UI/StatCard";
import { DetailsElements, DetailsTickets } from "../../../services/dashboard/DashboardService";
import './Dashboard.css'

export default function Dashboard() {
    const [details_E, setDetails_E] = useState([]);
    const [details_T, setDetails_T] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            DetailsElements(),
            DetailsTickets(),
        ])
            .then(([elements, tickets]) => {
                setDetails_E(elements);
                setDetails_T(tickets);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-container loading">
                <div className="spinner" />
                <p className="text-muted fw-medium animate-pulse">Chargement des statistiques...</p>
            </div>
        );
    }

    const totalElements = details_E.reduce((acc, curr) => acc + curr.count, 0);
    const totalTickets = details_T.reduce((acc, curr) => acc + curr.count, 0);

    return ( 
        <div className="container-fluid px-4 py-4" style={{ backgroundColor: "var(--bg-body)", minHeight: "calc(100vh - 70px)" }}>
            {/* Titre de la page avec une bordure discrète en dessous */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Tableau de bord</h1>
                    <p className="text-muted small m-0 mt-1">Vue d'ensemble des éléments et des tickets en temps réel.</p>
                </div>
            </div>
            
            {/* Cartes de statistiques */}
            <div className="row mb-4 g-4 d-flex justify-content-">
                <div className="col-xl-6 col-md-6">
                    <StatCard 
                        title="Éléments" 
                        amount={totalElements} 
                        footerText="Nombre total d'éléments" 
                        icon="bi bi-pc-display"
                    />
                </div>
                <div className="col-xl-6 col-md-6">
                    <StatCard 
                        title="Tickets" 
                        amount={totalTickets} 
                        footerText="Nombre total de tickets" 
                        icon="bi bi-ticket-perforated-fill"
                    />
                </div>
            </div>

            {/* Tableaux de détails */}
            <div className="row g-4">
                {/* Tableau Éléments */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4 h-100" style={{ backgroundColor: "var(--bg-card, #ffffff)" }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-pie-chart-fill text-primary fs-5"></i>
                            <h4 className="fw-bold m-0 text-secondary fs-5">Éléments par type</h4>
                        </div>
                        <div className="table-responsive flex-grow-1">
                            <table className="table table-borderless table-hover align-middle m-0">
                                <thead className="border-bottom border-light">
                                    <tr>
                                        <th className="text-muted small text-uppercase fw-bold ps-0">Type d'élément</th>
                                        <th className="text-muted small text-uppercase fw-bold text-end pe-0">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details_E.map((row, index) => (
                                        <tr key={index} className="border-bottom border-light last-border-0">
                                            <td className="fw-medium py-3 ps-3 text-dark">{row.item}</td>
                                            <td className="text-end fw-bold py-3 pe-3 text-secondary">{row.count}</td>
                                        </tr>
                                    ))}
                                    {details_E.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-4">Aucune donnée disponible</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Tableau Tickets */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4 h-100" style={{ backgroundColor: "var(--bg-card, #ffffff)" }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-bar-chart-line-fill text-success fs-5"></i>
                            <h4 className="fw-bold m-0 text-secondary fs-5">Tickets par type</h4>
                        </div>
                        <div className="table-responsive flex-grow-1">
                            <table className="table table-borderless table-hover align-middle m-0">
                                <thead className="border-bottom border-light">
                                    <tr>
                                        <th className="text-muted small text-uppercase fw-bold ps-0">Type de ticket</th>
                                        <th className="text-muted small text-uppercase fw-bold text-end pe-0">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details_T.map((row, index) => (
                                        <tr key={index} className="border-bottom border-light last-border-0">
                                            <td className="fw-medium py-3 ps-3 text-dark">{row.type}</td>
                                            <td className="text-end fw-bold py-3 pe-3 text-success">{row.count}</td>
                                        </tr>
                                    ))}
                                    {details_T.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-4">Aucune donnée disponible</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}