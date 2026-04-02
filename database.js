const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kundenname TEXT,
            adresse TEXT,
            produkt TEXT,
            preis TEXT,
            auftragsnummer TEXT UNIQUE,
            iban TEXT,
            iban_inhaber TEXT,
            bic TEXT,
            beschreibung TEXT,
            beleg TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating table", err);
            }
        });
    }
});

module.exports = db;
