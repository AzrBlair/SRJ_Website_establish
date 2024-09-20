const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

let db = new sqlite3.Database('./UR_cust.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the local SQLite database.');
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Endpoint to handle sign up
app.post('/api/signup', (req, res) => {
    const { newUsername, newPassword } = req.body;

    // Store password without hashing (not recommended for security)
    const insertQuery = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';

    db.run(insertQuery, [newUsername, newPassword], function(err) {
        if (err) {
            return res.status(500).send({ success: false, message: err.message });
        }
        res.send({ success: true });
    });
});

// Endpoint to handle login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], (err, row) => {
        if (err) {
            return res.status(500).send({ success: false, message: err.message });
        }

        if (!row || row.password_hash !== password) {
            return res.status(401).send({ success: false, message: 'Invalid username or password.' });
        }
        res.send({ success: true }); // Respond with success
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Close the database connection when done
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});

app.use(express.static(__dirname));