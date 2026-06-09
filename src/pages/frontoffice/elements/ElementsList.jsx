import { useState, useEffect } from "react";
import { getElementItems, ListeElements } from "../../../services/elements/ElementService";
import { getItems, initSession } from "../../../services/api";
import Header from "../Header";

export default function ElementsList() {
    // ======================
    // STATES
    // ======================
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [allElements, setAllElements] = useState([]); // Stocke l'intégralité des données chargées une seule fois
    const [itemTypes, setItemTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [loading, setLoading] = useState(false);

    // Pagination locale (Frontend)
    const [page, setPage] = useState(1);
    const [limit] = useState(6); 

    // ======================
    // 1. INITIALISATION DE LA SESSION GLPI
    // ======================
    useEffect(() => {
        const checkSession = async () => {
            try {
                if (!sessionStorage.getItem("glpi_session_token")) {
                    await initSession("glpi", "glpi");
                }
            } catch (error) {
                console.error("Erreur lors de l'initialisation de la session GLPI:", error);
            }
        };
        checkSession();
    }, []);

    // ======================
    // 2. CHARGEMENT UNIQUE DE TOUTES LES DONNÉES
    // ======================
    useEffect(() => {
        const loadAllDataOnce = async () => {
            try {
                setLoading(true);
                
                // Appel au service modifié (sans page ni limit)
                const items = await ListeElements();
                setAllElements(items);
                
                const types = getElementItems();
                setItemTypes(types);
                
                const states = await getItems("State");
                setStatuses(states || []);
            } catch (error) {
                console.error("Erreur de récupération globale:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAllDataOnce();
    }, []); // Tableau de dépendances vide -> S'exécute uniquement au chargement initial du composant

    // Revenir à la page 1 automatiquement dès qu'un filtre change pour éviter de rester bloqué sur une page vide
    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterType, filterStatus]);

    // ======================
    // 3. FILTRAGE (FRONTEND)
    // ======================
    const filteredElements = allElements.filter(el => {
        const name = (el.name || "").toLowerCase();
        const location = (el.location || "").toLowerCase();

        const matchSearch =
            name.includes(searchTerm.toLowerCase()) ||
            location.includes(searchTerm.toLowerCase());

        const matchType =
            filterType === "" || el.itemtype === filterType;

        const matchStatus =
            filterStatus === "" ||
            String(el.states_id) === String(filterStatus);

        return matchSearch && matchType && matchStatus;
    });

    // ======================
    // 4. PAGINATION (FRONTEND VIA SLICE)
    // ======================
    const totalPages = Math.ceil(filteredElements.length / limit);
    
    // On extrait seulement les éléments de la page actuelle à partir du tableau déjà filtré
    const indexDebut = (page - 1) * limit;
    const indexFin = indexDebut + limit;
    const elementsDeLaPage = filteredElements.slice(indexDebut, indexFin);

    const getPages = () => {
        const max = 5;
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + max - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    return (
        <div className="min-vh-100 bg-light">
            
            {/* ================= HEADER FRONT-OFFICE ================= */}
            <Header/>

            {/* ================= CONTENU PRINCIPAL ================= */}
            <div className="container py-5" style={{ maxWidth: "1100px" }}>
                
                <div className="mb-4">
                    <h1 className="fw-bold m-0" style={{ color: "var(--text-secondary)" }}>Liste des Éléments</h1>
                    <p className="text-muted small">Consultez, recherchez et filtrez l'ensemble des équipements (Chargement complet en cache local).</p>
                </div>

                {/* ================= FILTRES ================= */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-secondary-subtle text-muted"><i className="bi bi-search"></i></span>
                                <input
                                    className="form-control border-secondary-subtle border-start-0 shadow-none"
                                    placeholder="Rechercher par nom, lieu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select border-secondary-subtle shadow-none"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">Tous les types de matériels</option>
                                {itemTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select border-secondary-subtle shadow-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                {statuses.map(state => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ================= BLOCS DE CARTES / LOADER ================= */}
                {loading ? (
                    <div className="text-center py-5 my-5">
                        <div className="spinner-border text-secondary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="text-muted fw-medium">Importation et indexation complète du parc GLPI...</p>
                    </div>
                ) : (
                    <>
                        {/* On boucle désormais sur "elementsDeLaPage" au lieu de filteredElements directement */}
                        <div className="row row-cols-1 row-cols-md-2 g-3 mb-4">
                            {elementsDeLaPage.length > 0 ? (
                                elementsDeLaPage.map(el => (
                                    <div className="col" key={`${el.itemtype}-${el.id}`}>
                                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
                                            <div className="d-flex align-items-center gap-3">
                                                
                                                <div className="rounded-3 d-flex align-items-center justify-content-center bg-light border" style={{ width: "60px", height: "60px", flexShrink: 0 }}>
                                                    {el.image ? (
                                                        <img src={el.image} alt={el.name} className="img-fluid rounded-3 p-1" style={{ maxHeight: "100%" }} />
                                                    ) : (
                                                        <i className={`${el.icon || 'bi bi-cpu'} fs-3 text-secondary`}></i>
                                                    )}
                                                </div>

                                                <div className="flex-grow-1 text-truncate">
                                                    <div className="d-flex align-items-start justify-content-between gap-2">
                                                        <h5 className="fw-bold text-dark text-truncate mb-0 fs-6" title={el.name}>{el.name}</h5>
                                                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2.5 py-1 small" style={{ fontSize: "0.75rem" }}>
                                                            #{el.id}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-muted small mb-1 text-truncate mt-0.5">
                                                        <span className="fw-medium text-dark">{el.itemtype}</span>
                                                        {el.model ? ` • ${el.model}` : ''}
                                                    </p>

                                                    <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-light">
                                                        <div className="d-flex align-items-center gap-1 text-muted small text-truncate">
                                                            <i className="bi bi-geo-alt small"></i>
                                                            <span className="text-truncate">{el.location || "—"}</span>
                                                        </div>
                                                        <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                                            {el.stateName || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 w-100">
                                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                        <i className="bi bi-layers text-muted fs-1 mb-2"></i>
                                        <p className="text-muted mb-0 fw-medium">Aucun composant ne correspond à vos critères.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ================= PAGINATION FRONTEND ACCORDÉE AUX FILTRES ================= */}
                        {totalPages > 1 && (
                            <nav className="d-flex justify-content-center mt-4">
                                <ul className="pagination pagination-sm gap-1 mb-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border px-3 shadow-none" onClick={() => goToPage(page - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    
                                    {getPages().map(p => (
                                        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                            <button 
                                                className="page-link rounded-3 border px-3 shadow-none fw-medium"
                                                style={p === page ? { backgroundColor: "var(--bg-btn-primary)", borderColor: "var(--bg-btn-primary)", color: "#fff" } : { color: "var(--text-secondary)" }}
                                                onClick={() => goToPage(p)}
                                            >
                                                {p}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border px-3 shadow-none" onClick={() => goToPage(page + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}