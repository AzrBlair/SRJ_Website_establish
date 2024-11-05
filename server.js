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

// // API endpoint to fetch unique Machine Makes (MMake) and Machine Models (MModel)
// app.get('/api/search', (req, res) => {
//     const field = req.query.field;
//     console.log(`Received request to fetch unique values for field: ${field}`); // Log request field

//     if (field === 'MMake' || field === 'MModel') {
//         db.all(`SELECT DISTINCT ${field} FROM machines`, [], (err, rows) => {
//             if (err) {
//                 console.error('Database error:', err.message);
//                 res.status(500).send('Database error');
//             } else {
//                 console.log(`Fetched ${rows.length} unique values for field ${field}:`, rows); // Log results
//                 res.json(rows);
//             }
//         });
//     } else {
//         console.error('Invalid search field:', field); // Log invalid field request
//         res.status(400).send('Invalid search field');
//     }
// });

// Endpoint to fetch suggestions for Machine Make or Model based on input
app.get('/api/search-suggestions', (req, res) => {
    const query = `%${req.query.query}%`;
    const field = req.query.field === 'MMake' ? 'MMake' : 'MModel';
    db.all(`SELECT DISTINCT ${field} AS name FROM machines WHERE ${field} LIKE ? ORDER BY name ASC`, [query], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).send('Database error');
        } else {
            res.json(rows);
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