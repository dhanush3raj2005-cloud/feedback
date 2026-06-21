require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Setup Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// Example route to test database connection
app.get('/api/check-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ status: 'Connected to database successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Example route to receive feedback
app.post('/api/feedback', async (req, res) => {
    const { name, message } = req.body;
    try {
        await pool.execute('INSERT INTO feedback (name, message) VALUES (?, ?)', [name, message]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});