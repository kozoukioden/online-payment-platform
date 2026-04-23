const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_JvC7HiEh8sDV@ep-tiny-brook-anrgu9l9-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
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
