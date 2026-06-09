import { useState, useEffect } from "react";
import StatCard from "../../../assets/components/UI/StatCard";
import { DetailsElements, DetailsTickets, getElementItems } from "../../../services/dashboard/DashboardService";
import './Dashboard.css'

export default function Dashboard() {
    // console.log("Session : ", sessionStorage.getItem("glpi_session_token"))
    const [details_E, setDetails_E] = useState([]);
    const [details_T, setDetails_T] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            DetailsElements().then(rows => rows.filter(r => r.count > 0)),
            DetailsTickets(),
        ])
            .then(([elements, tickets]) => {
            setDetails_E(elements);
            setDetails_T(tickets);
            })
            .finally(() => setLoading(false)); // ✅ fonction fléchée
    }, []);

    if (loading) {
        return (
        <div className="dashboard-container loading">
            <div className="spinner" />
            <p>Chargement des statistiques...</p>
        </div>
        );
    }

    const totalElements = details_E.reduce((acc, curr) => acc + curr.count, 0);
    const totalTickets = details_T.reduce((acc, curr) => acc + curr.count, 0);

    return ( 
        <div className="container p-4">
            <h1 className="mb-4 fw-bold" style={{ color : "var(--text-secondary)"}}>Tableau de Bord</h1>
            
            <div className="row mb-5 g-4">
                <div className="col-md-6">
                    <StatCard title="Éléments" amount={totalElements} footerText="Nombre total d'éléments" icon="bi bi-pc-display"/>
                </div>
                <div className="col-md-6">
                    <StatCard title="Tickets" amount={totalTickets} footerText="Nombre total de tickets" icon="bi bi-ticket-perforated-fill"/>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-3" style={{ backgroundColor: "var(--bg-card)" }}>
                        <h4 className="fw-bold mb-3 text-secondary">Éléments par Type</h4>
                        <div className="table-responsive">
                            <table className="table table-borderless table-hover align-middle">
                                <thead className="border-bottom">
                                    <tr>
                                        <th className="text-muted">Type d'élément</th>
                                        <th className="text-muted text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details_E.map((row, index) => (
                                        <tr key={index}>
                                            <td className="fw-medium">{row.item}</td>
                                            <td className="text-end fw-bold">{row.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-3" style={{ backgroundColor: "var(--bg-card)" }}>
                        <h4 className="fw-bold mb-3 text-secondary">Tickets par Type</h4>
                        <div className="table-responsive">
                            <table className="table table-borderless table-hover align-middle">
                                <thead className="border-bottom">
                                    <tr>
                                        <th className="text-muted">Type de ticket</th>
                                        <th className="text-muted text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details_T.map((row, index) => (
                                        <tr key={index}>
                                            <td className="fw-medium">{row.type}</td>
                                            <td className="text-end fw-bold">{row.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}