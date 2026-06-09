import { useState, useEffect } from "react";
import { getItems, createItem } from "../../../services/api"
import { CountElements, getElementItems, ListeElements } from "../../../services/elements/ElementService";

// Mock data pour la liste des éléments qu'on peut associer
const MOCK_AVAILABLE_ELEMENTS = [
    { id: 101, name: "PC-Bureau-01", type: "Ordinateur" },
    { id: 102, name: "Imp-Laser-HQ", type: "Imprimante" },
    { id: 103, name: "MacBook-Pro-Dev", type: "Ordinateur" },
    { id: 104, name: "Switch-Core", type: "Réseau" },
];

export default function CreateTicket() {
    const [title, setTitle] = useState("");
    const [users, setUsers] = useState([]);
    const [elements, setElements] = useState([]);
    const [type, setType] = useState("Incident");
    const [description, setDescription] = useState("");
    const [selectedElements, setSelectedElements] = useState([]);

    const handleToggleElement = (elId) => {
        if (selectedElements.includes(elId)) {
            setSelectedElements(selectedElements.filter(id => id !== elId));
        } else {
            setSelectedElements([...selectedElements, elId]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const items = await ListeElements(1, 30);
            setElements(items);
            const users = await getItems("Users")
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulation d'envoi
        alert(`Ticket créé avec succès !\nTitre : ${title}\nÉléments liés : ${selectedElements.length}`);
        // Reset form
        setTitle("");
        setType("Incident");
        setDescription("");
        setSelectedElements([]);
    };

    return (
        <div className="container p-4" style={{ maxWidth: "800px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold m-0" style={{ color : "var(--text-secondary)"}}>Créer un Ticket</h1>
            </div>

            <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-medium text-secondary">Titre du ticket *</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Ex: Problème d'accès à internet" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-medium text-secondary">Type de demande *</label>
                        <select className="form-select" value={type} onChange={e => setType(e.target.value)} required>
                            <option value="Incident">Incident</option>
                            <option value="Demande">Demande</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-medium text-secondary">Description détaillée</label>
                        <textarea 
                            className="form-control" 
                            rows="4" 
                            placeholder="Décrivez votre problème ou demande..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-medium text-secondary mb-3">Associer des éléments (Optionnel)</label>
                        <div className="row g-3">
                            {MOCK_AVAILABLE_ELEMENTS.map(el => {
                                const isSelected = selectedElements.includes(el.id);
                                return (
                                    <div className="col-md-6" key={el.id}>
                                        <div 
                                            className={`p-3 border rounded-3 text-start bg-white`}
                                            style={{ 
                                                cursor: "pointer", 
                                                borderColor: isSelected ? "var(--bg-btn-primary) !important" : "#dee2e6",
                                                borderWidth: isSelected ? "2px !important" : "1px",
                                                transition: "all 0.2s"
                                            }}
                                            onClick={() => handleToggleElement(el.id)}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <div className="fw-bold">{el.name}</div>
                                                    <div className="text-muted small">{el.type}</div>
                                                </div>
                                                <div>
                                                    {isSelected ? (
                                                        <i className="bi bi-check-circle-fill text-success fs-5"></i>
                                                    ) : (
                                                        <i className="bi bi-circle text-muted fs-5"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="d-flex justify-content-end gap-3">
                        <button type="button" className="btn btn-outline-secondary px-4 rounded-pill">Annuler</button>
                        <button 
                            type="submit" 
                            className="btn px-4 rounded-pill text-white fw-medium shadow-sm"
                            style={{ backgroundColor: "var(--bg-btn-primary)" }}
                        >
                            Soumettre le ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}