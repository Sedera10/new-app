import { useState } from "react";

const MOCK_ELEMENTS = [
    { id: 101, name: "PC-Bureau-01", type: "Ordinateur", status: "Actif", location: "Bâtiment A" },
    { id: 102, name: "Imp-Laser-HQ", type: "Imprimante", status: "En panne", location: "Bâtiment B" },
    { id: 103, name: "MacBook-Pro-Dev", type: "Ordinateur", status: "Actif", location: "Bâtiment C" },
    { id: 104, name: "Switch-Core", type: "Réseau", status: "Actif", location: "Bâtiment A" },
    { id: 105, name: "Ecran-27-Dell", type: "Écran", status: "Stock", location: "Archive" },
];

export default function ElementsList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Filtrage basique en mémoire
    const filteredElements = MOCK_ELEMENTS.filter(el => {
        const matchSearch = el.name.toLowerCase().includes(searchTerm.toLowerCase()) || el.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === "" || el.type === filterType;
        const matchStatus = filterStatus === "" || el.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    return (
        <div className="container p-4">
            <h1 className="mb-4 fw-bold" style={{ color : "var(--text-secondary)"}}>Liste des Éléments (Front-Office)</h1>

            {/* Zone de recherche multi-critères */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <h5 className="mb-3 text-secondary">Recherche avancée</h5>
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Mots-clés (nom, lieu)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Rechercher..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Type</label>
                        <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">Tous les types</option>
                            <option value="Ordinateur">Ordinateur</option>
                            <option value="Imprimante">Imprimante</option>
                            <option value="Réseau">Réseau</option>
                            <option value="Écran">Écran</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Statut</label>
                        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Tous les statuts</option>
                            <option value="Actif">Actif</option>
                            <option value="En panne">En panne</option>
                            <option value="Stock">Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Résultats */}
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="border-bottom text-muted">
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Lieu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredElements.length > 0 ? (
                                filteredElements.map(el => (
                                    <tr key={el.id}>
                                        <td className="text-secondary fw-medium">#{el.id}</td>
                                        <td className="fw-bold">{el.name}</td>
                                        <td>{el.type}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${
                                                el.status === 'Actif' ? 'text-bg-success' :
                                                el.status === 'En panne' ? 'text-bg-danger' : 'text-bg-secondary'
                                            }`}>
                                                {el.status}
                                            </span>
                                        </td>
                                        <td>{el.location}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">Aucun élément trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}