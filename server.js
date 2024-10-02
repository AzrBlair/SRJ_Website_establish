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

// Customer login database (UR_customer.db) remains unchanged
let customerDb = new sqlite3.Database('./UR_customer.db', (err) => {
    if (err) {
        console.error('Customer DB connection error:', err.message);
    }
    console.log('Connected to the customer SQLite database.');
});

// Search database (search.db) for the search functionality
let searchDb = new sqlite3.Database('./search.db', (err) => {
    if (err) {
        console.error('Search DB connection error:', err.message);
    }
    console.log('Connected to the search SQLite database.');
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Search API uses the 'search.db' database
app.get('/api/search', (req, res) => {
  const query = req.query.query;

  if (!query) {
      return res.status(400).send({ success: false, message: 'Query is required' });
  }

  console.log(`Searching for: ${query}`);

  const searchQuery = `
      SELECT DISTINCT make_brand FROM machines 
      WHERE make_brand LIKE ? OR model LIKE ?
  `;

  // Make the search more specific: return only results where make/brand starts with the query
  searchDb.all(searchQuery, [`${query}%`, `${query}%`], (err, rows) => {
      if (err) {
          console.error('Database error:', err.message);
          return res.status(500).send({ success: false, message: err.message });
      }

      res.json(rows);  // Send back the results as JSON
  });
});

// Endpoint to fetch models based on the machine make
app.get('/api/models', (req, res) => {
  const make = req.query.make;

  if (!make) {
      return res.status(400).send({ success: false, message: 'Make is required' });
  }

  const query = 'SELECT DISTINCT model FROM machines WHERE make_brand = ?';
  searchDb.all(query, [make], (err, rows) => {
      if (err) {
          return res.status(500).send({ success: false, message: err.message });
      }
      res.json(rows);
  });
});

// Endpoint to fetch sizes based on the selected model
app.get('/api/sizes', (req, res) => {
  const make = req.query.make;
  const model = req.query.model;

  if (!make || !model) {
      return res.status(400).send({ success: false, message: 'Make and model are required' });
  }

  const query = 'SELECT DISTINCT size FROM machines WHERE make_brand = ? AND model = ?';
  searchDb.all(query, [make, model], (err, rows) => {
      if (err) {
          return res.status(500).send({ success: false, message: err.message });
      }
      res.json(rows);
  });
});

// Original sign-up logic (without password hashing)
app.post('/api/signup', (req, res) => {
    const { newUsername, newPassword } = req.body;

    if (!newUsername || !newPassword) {
        return res.status(400).send({ success: false, message: 'Username and password are required' });
    }

    // Insert into the users table (assuming a users table exists)
    const insertQuery = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';

    customerDb.run(insertQuery, [newUsername, newPassword], function(err) {
        if (err) {
            return res.status(500).send({ success: false, message: err.message });
        }
        res.send({ success: true, message: 'User signed up successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Close the database connections when done
process.on('SIGINT', () => {
    customerDb.close((err) => {
        if (err) {
            console.error('Error closing customer DB:', err.message);
        }
        console.log('Closed the customer database connection.');

        searchDb.close((err) => {
            if (err) {
                console.error('Error closing search DB:', err.message);
            }
            console.log('Closed the search database connection.');
            process.exit(0);
        });
    });
});