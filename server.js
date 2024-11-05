const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let db = new sqlite3.Database('./MMM_db.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    }
    console.log('Connected to the MMM_db SQLite database.');
});

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// API for fetching suggestions based on Machine Make or Model
app.get('/api/search', (req, res) => {
    const field = req.query.field;
    const query = req.query.query ? `%${req.query.query}%` : '%';

    if (field === 'MMake' || field === 'MModel') {
        db.all(`SELECT DISTINCT ${field} FROM machines WHERE ${field} LIKE ?`, [query], (err, rows) => {
            if (err) {
                res.status(500).send('Database error');
            } else {
                res.json(rows);
            }
        });
    } else {
        res.status(400).send('Invalid search field');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Close the database connection when the server stops
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});