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
app.get('/api/orders/track/:code', (req, res) => {
    const code = req.params.code;
    db.get('SELECT * FROM orders WHERE auftragsnummer = ?', [code], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(row);
    });
});

// APIs for Admin Panel
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

// Basic middleware for admin endpoints
app.use('/api/admin', (req, res, next) => {
    // In a real app we'd use sessions or JWT.
    // For this simple panel, we might just pass headers or use basic auth.
    // Since it's a quick frontend-only protection model, we'll use a specific header.
    const auth = req.headers['authorization'];
    if (auth === `Basic ${Buffer.from(ADMIN_USER + ':' + ADMIN_PASS).toString('base64')}`) {
        return next();
    }
    res.status(401).send('Unauthorized');
});

// Get all orders
app.get('/api/admin/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create new order
app.post('/api/admin/orders', (req, res) => {
    const { kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung } = req.body;
    db.run(
        `INSERT INTO orders (kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Edit order
app.put('/api/admin/orders/:id', (req, res) => {
    const { kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung } = req.body;
    db.run(
        `UPDATE orders SET kundenname=?, adresse=?, produkt=?, preis=?, auftragsnummer=?, iban=?, iban_inhaber=?, bic=?, beschreibung=? WHERE id=?`,
        [kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Delete order
app.delete('/api/admin/orders/:id', (req, res) => {
    db.run(`DELETE FROM orders WHERE id=?`, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Customer Route: Upload Receipt
app.post('/api/orders/upload-receipt', upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const orderCode = req.body.auftragsnummer;
    if (!orderCode) {
        return res.status(400).json({ error: "Missing order code" });
    }
    
    const belegUrl = '/uploads/' + req.file.filename;

    db.run('UPDATE orders SET beleg=? WHERE auftragsnummer=?', [belegUrl, orderCode], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, url: belegUrl });
    });
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

app.use((req, res, next) => {
    res.status(404).json({error: "Not found"});
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
