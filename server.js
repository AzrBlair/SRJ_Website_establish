const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000; //http://localhost:3000

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

app.get('/api/getCategories', (req, res) => {
    db.all('SELECT C_name FROM Category', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error fetching categories");
        } else {
            res.json(rows);
        }
    });
});

// API endpoint to fetch unique Machine Makes (MMake) and Machine Models (MModel)
app.get('/api/search', (req, res) => {
    const field = req.query.field;
    console.log(`Received request to fetch unique values for field: ${field}`); // Log request field

    if (field === 'MMake' || field === 'MModel') {
        db.all(`SELECT DISTINCT ${field} FROM machines`, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).send('Database error');
            } else {
                console.log(`Fetched ${rows.length} unique values for field ${field}:`, rows); // Log results
                res.json(rows);
            }
        });
    } else {
        console.error('Invalid search field:', field); // Log invalid field request
        res.status(400).send('Invalid search field');
    }
});

// Endpoint to fetch suggestions for Machine Make or Model based on input
app.get('/api/search-suggestions', (req, res) => {
    const query = req.query.query ? `%${req.query.query}%` : '%'; // Use '%' if query is empty
    const field = req.query.field === 'MMake' ? 'MMake' : 'MModel';
    const makeCondition = req.query.make ? 'AND MMake = ?' : '';
    const params = req.query.make ? [req.query.make, query] : [query];

    const sql = `
        SELECT DISTINCT ${field} AS name 
        FROM machines 
        WHERE ${field} LIKE ? ${makeCondition}
        ORDER BY name ASC
    `;
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).send('Database error');
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to fetch models based on machine make
app.get('/api/models', (req, res) => {
    const make = req.query.make;
    if (!make) {
        return res.status(400).send('Make parameter is required');
    }

    const query = `SELECT DISTINCT MModel AS model FROM machines WHERE MMake = ? ORDER BY model ASC`;
    db.all(query, [make], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).send('Database error');
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to fetch sizes based on machine make and model
app.get('/api/sizes', (req, res) => {
    const make = req.query.make;
    const model = req.query.model;

    if (!make || !model) {
        return res.status(400).send('Make and model parameters are required');
    }

    const query = `SELECT DISTINCT Tsize AS size FROM machines WHERE MMake = ? AND MModel = ? ORDER BY size ASC`;
    db.all(query, [make, model], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).send('Database error');
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to fetch ImageLink based on make, model, and size
app.get('/api/getImageLink', (req, res) => {
    const make = req.query.make;
    const model = req.query.model;
    const size = req.query.size;

    if (!make || !model || !size) {
        return res.status(400).send('Make, model, and size parameters are required');
    }

    const query = `SELECT ImageLink FROM machines WHERE MMake = ? AND MModel = ? AND Tsize = ?`;
    db.get(query, [make, model, size], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).send('Database error');
        } else if (row) {
            res.json({ imageLink: row.ImageLink });
        } else {
            res.status(404).send('ImageLink not found for the specified make, model, and size');
        }
    });
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
