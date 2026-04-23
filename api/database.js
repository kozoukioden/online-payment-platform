const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize the database table if it doesn't exist
const initDb = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Connected to Vercel Postgres and verified orders table.');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

module.exports = pool;
