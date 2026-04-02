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

const staticPath = path.join(__dirname, 'onlinepaymentplatform-clone-perfect');
app.use(express.static(staticPath));
// We also need to serve uploads so admin can view them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/'))
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

// Fallback all missing routes to index.html to allow SPA-like behavior if needed
// (We could also leave it strictly to express.static)
app.use((req, res, next) => {
  // Only fallback if the path doesn't start with /api or /uploads and is a GET request
  if(req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && req.path !== '/admin' && req.path !== '/admin.html') {
      res.sendFile(path.join(staticPath, 'index.html'));
  } else {
      res.status(404).json({error: "Not found"});
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
