const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new Database("tickets.db");

// Initialisation des tables
db.exec(`
CREATE TABLE IF NOT EXISTS ticket_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gasy_name TEXT NOT NULL,
    color TEXT,
    glpi_link INTEGER
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS ticket_super_cost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    cost REAL NOT NULL DEFAULT 0,
    frais_ouverture REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

// Migration automatique si colonne manquante
const ticketSuperCostColumns = db.prepare(`PRAGMA table_info(ticket_super_cost)`).all().map(column => column.name);
if (!ticketSuperCostColumns.includes("frais_ouverture")) {
    db.exec(`ALTER TABLE ticket_super_cost ADD COLUMN frais_ouverture REAL NOT NULL DEFAULT 0`);
}

db.exec(`
INSERT OR IGNORE INTO ticket_status (name, gasy_name, color, glpi_link) 
VALUES 
('Nouveau', 'Vaovao', '#CFE8FF', 1),
('In progress', 'efa manao', '#FFE6C7', 2),
('Terminé', 'vita', '#DFF4DF', 6)
`);

console.log("Base SQLite initialisée");

// --- ROUTES ---

app.get("/status", (req, res) => {
    const statuses = db.prepare(`SELECT * FROM ticket_status ORDER BY id`).all();
    res.json(statuses);
});

app.post("/ticket-super-cost", (req, res) => {
    const { ticket_id, cost } = req.body;
    const frais_ouverture = Number(req.body.frais_ouverture || 0);

    if (!Number.isFinite(ticket_id) || ticket_id <= 0) return res.status(400).json({ message: "Ticket invalide" });
    if (!Number.isFinite(cost) || cost < 0) return res.status(400).json({ message: "Super-cost invalide" });

    const result = db.prepare(`INSERT INTO ticket_super_cost (ticket_id, cost, frais_ouverture) VALUES (?, ?, ?)`).run(ticket_id, cost, frais_ouverture);
    res.status(201).json({ id: result.lastInsertRowid, message: "Super-cost créé" });
});

app.get("/ticket-super-cost", (req, res) => {
    const status = db.prepare(`
        SELECT ticket_id, SUM(cost) AS super_cost, SUM(frais_ouverture) AS frais_ouverture, SUM(cost + frais_ouverture) AS total_super_cost
        FROM ticket_super_cost GROUP BY ticket_id
    `).all();
    res.json(status);
});

// ROUTE ANNULATION / REOUVERTURE (Clos -> En cours)
app.post("/ticket-reopening", (req, res) => {
    const ticketId = Number(req.body.ticket_id);
    const percentage = Number(req.body.percentage || req.body.reopenPercentage);

    if (!Number.isFinite(ticketId) || ticketId <= 0) return res.status(400).json({ message: "Ticket invalide" });
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) return res.status(400).json({ message: "Pourcentage invalide" });

    // Récupérer le dernier supercost actif (> 0)
    const last = db.prepare(`
        SELECT * FROM ticket_super_cost 
        WHERE ticket_id = ? AND cost > 0 
        ORDER BY id DESC LIMIT 1
    `).get(ticketId);

    if (!last) {
        return res.status(404).json({ message: "Aucun dernier super-cost trouvé pour ce ticket" });
    }

    // Calcul des frais d'ouverture basés sur le dernier coût
    const frais_ouverture = Math.round((Number(last.cost) * percentage / 100) * 100) / 100;

    // Transaction : Suppression du dernier coût et insertion des frais d'ouverture
    const transaction = db.transaction(() => {
        db.prepare(`DELETE FROM ticket_super_cost WHERE id = ?`).run(last.id);
        db.prepare(`INSERT INTO ticket_super_cost (ticket_id, cost, frais_ouverture) VALUES (?, 0, ?)`).run(ticketId, frais_ouverture);
    });

    transaction();

    res.status(201).json({
        message: "Annulation traitée avec succès",
        deleted_super_cost_id: last.id,
        frais_ouverture
    });
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));