const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion SQLite
const db = new Database("tickets.db");

db.exec(
    `DROP TABLE ticket_status`
)
// Création de la table
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
INSERT OR IGNORE INTO ticket_status (
    name,gasy_name,color,glpi_link
) VALUES (
    'Nouveau','Vaovao','#CFE8FF',1
),
(
    'In progress','efa manao','#FFE6C7',2
),
(
    'Terminé','vita','#DFF4DF',6
)
`);

console.log("Base SQLite initialisée");

// ========================
// ROUTES
// ========================

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "API SQLite OK"
    });
});

// Lire tous les statuts
app.get("/status", (req, res) => {
    const statuses = db.prepare(`
        SELECT *
        FROM ticket_status
        ORDER BY id
    `).all();

    res.json(statuses);
});

// Ajouter un statut
app.post("/status", (req, res) => {

    const {
        name,
        gasy_name,
        color,
        glpi_link
    } = req.body;

    const stmt = db.prepare(`
        INSERT INTO ticket_status
        (
            name,
            gasy_name,
            color,
            glpi_link
        )
        VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
        name,
        gasy_name,
        color,
        glpi_link
    );

    res.status(201).json({
        id: result.lastInsertRowid,
        message: "Statut créé"
    });
});

// Modifier un statut par ID
app.put("/status/:id", (req, res) => {
    const { name, gasy_name, color, glpi_link } = req.body;
    const { id } = req.params;

    const stmt = db.prepare(`
        UPDATE ticket_status
        SET name = ?, gasy_name = ?, color = ?, glpi_link = ?
        WHERE id = ?
    `);

    const result = stmt.run(name, gasy_name, color, glpi_link, id);

    if (result.changes === 0) {
        return res.status(404).json({ message: "Statut introuvable" });
    }

    res.json({ message: "Statut mis à jour avec succès" });
});

// Supprimer un statut par ID
app.delete("/status/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare(`
        DELETE FROM ticket_status
        WHERE id = ?
    `);
    const result = stmt.run(id);
    if (result.changes === 0) {
        return res.status(404).json({ message: "Statut introuvable" });
    }
    res.json({ message: "Statut supprimé avec succès" });
});

// Lire un statut par ID
app.get("/status/:id", (req, res) => {

    const status = db.prepare(`
        SELECT *
        FROM ticket_status
        WHERE id = ?
    `).get(req.params.id);

    if (!status) {
        return res.status(404).json({
            message: "Statut introuvable"
        });
    }

    res.json(status);
});

// Démarrage serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});