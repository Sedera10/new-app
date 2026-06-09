import { useState, useEffect } from "react";
import { CountElements, getElementItems, ListeElements } from "../../../services/elements/ElementService";
import { getItems } from "../../../services/api";

export default function ElementsList() {
    // ======================
    // STATES
    // ======================
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [elements, setElements] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    

    // ======================
    // LOAD DATA
    // ======================
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // elements multi-resources
                const items = await ListeElements(page, limit);
                setElements(items);
                const totalItems = await CountElements();
                setTotalPages(Math.ceil(totalItems / limit));
                // types depuis env
                const types = getElementItems();
                setItemTypes(types);
                // statuses GLPI
                const states = await getItems("State");
                setStatuses(states || []);

            } catch (error) {
                console.error("Erreur load elements:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, limit]);

    // ======================
    // FILTERING (FRONT)
    // ======================
    const filteredElements = elements.filter(el => {
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

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" />
                <p className="mt-2">Chargement des éléments...</p>
            </div>
        );
    }

    return (
        <div className="container p-4">

            <h1 className="mb-4 fw-bold" style={{ color: "var(--text-secondary)" }}>
                Liste des Éléments
            </h1>
            {/* ======================
                FILTRES
            ====================== */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <input
                            className="form-control"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">Tous les types</option>
                            {itemTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            {statuses.map(state => (
                                <option key={state.id} value={state.id}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
            </div>
            {/* ======================
                TABLE
            ====================== */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Type</th>
                                <th>Modèle</th>
                                <th>Statut</th>
                                <th>Lieu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredElements.length > 0 ? (
                                filteredElements.map(el => (
                                    <tr key={`${el.itemtype}-${el.id}`}>
                                        <td>#{el.id}</td>
                                        <td>{
                                            el.image
                                                ? ( 
                                                    <img
                                                        src={el.image}
                                                        alt={el.name}
                                                        width="40"
                                                    />
                                                )
                                                : (
                                                    <i className={`${el.icon} fs-3`}></i>
                                                )
                                            }
                                        </td>
                                        <td className="fw-bold">{el.name}</td>
                                        <td>{el.itemtype}</td>
                                        <td>{el.model}</td>
                                        <td>
                                            <span className="badge text-bg-secondary">
                                                {el.stateName || "N/A"}
                                            </span>
                                        </td>
                                        <td>{el.location || "—"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        Aucun élément trouvé
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>
            </div>
            {getPages().map(p => (
                <button
                    key={p}
                    className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => goToPage(p)}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}