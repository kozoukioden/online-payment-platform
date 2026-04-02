const db = require('./database');

db.run(
    `INSERT INTO orders (kundenname, adresse, produkt, preis, auftragsnummer, iban, iban_inhaber, bic, beschreibung)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        'Ahmet Yılmaz', 
        'Örnek Sokak No: 123, 34000 İstanbul, Türkiye', 
        'Online Payment Platform Site Integration', 
        '1500€', 
        'X24SA22', 
        'TR12 3456 7890 1234 5678 9012 34', 
        'Ahmet Yılmaz', 
        'EXBANKTR', 
        'X24SA22 Numaralı Sipariş Ödemesi'
    ],
    function(err) {
        if (err) {
            console.error("Error inserting test order:", err.message);
        } else {
            console.log("Test order X24SA22 inserted successfully!");
        }
    }
);
