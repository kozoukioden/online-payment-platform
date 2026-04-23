const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// We only need to serve uploads if they exist in /tmp or root (not recommended on Vercel)
// On Vercel, we'll serve from /tmp for the session
app.use('/uploads', express.static('/tmp'));

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp')
    },
    filename: function (req, file, cb) {
        // preserve original extension
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// API: Get order by Tracking Code
app.get('/api/orders/track/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const result = await db.query('SELECT * FROM orders WHERE auftragsnummer = $1', [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APIs for Admin Panel
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

// Basic middleware for admin endpoints
app.use('/api/admin', (req, res, next) => {
    const auth = req.headers['authorization'];
    if (auth === `Basic ${Buffer.from(ADMIN_USER + ':' + ADMIN_PASS).toString('base64')}`) {
        return next();
    }
    res.status(401).send('Unauthorized');
});

// Get all orders
app.get('/api/admin/orders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new order
app.post('/api/admin/orders', async (req, res) => {
    try {
        const { kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung } = req.body;
        const result = await db.query(
            `INSERT INTO orders (kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit order
app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const { kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung } = req.body;
        await db.query(
            `UPDATE orders SET kundenname=$1, adresse=$2, produkt=$3, preis=$4, auftragsnummer=$5, iban=$6, iban_inhaber=$7, bic=$8, beschreibung=$9 WHERE id=$10`,
            [kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete order
app.delete('/api/admin/orders/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Route: Upload Receipt
app.post('/api/orders/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const orderCode = req.body.auftragsnummer;
        if (!orderCode) {
            return res.status(400).json({ error: "Missing order code" });
        }
        
        const belegUrl = '/uploads/' + req.file.filename;

        await db.query('UPDATE orders SET beleg=$1 WHERE auftragsnummer=$2', [belegUrl, orderCode]);
        res.json({ success: true, url: belegUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the admin panel itself with basic auth protection natively for simplicity
app.get(['/admin', '/admin.html'], (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login === ADMIN_USER && password === ADMIN_PASS) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.set('WWW-Authenticate', 'Basic realm="401"');
        res.status(401).send('Authentication required.');
    }
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '../onlinepaymentplatform-clone-perfect');
app.use(express.static(frontendPath));

// Route root to index.html explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((req, res, next) => {
    res.status(404).json({error: "Not found"});
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
