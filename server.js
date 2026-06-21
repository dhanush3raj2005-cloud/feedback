const express = require('express');
const mysql = require('mysql2'); // Import the mysql2 driver
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Serve HTML files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;

// ==========================================
// YOUR EXACT DATABASE CONNECTION CONFIG
// ==========================================
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "6369071540",
  database: "feedback", 
  port: 3306
});

// Establish the connection to MariaDB
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed!");
    console.error("Error details:", err.message);
    console.log("\n👉 Fix Tip: Make sure your MariaDB server is running and you have already created the 'feedback' database.");
    return;
  }
  console.log("🚀 Connected to MariaDB successfully!");
  initializeDatabase(); // Automatically create the table now that we are connected
});

// Automatically create the feedback table if it doesn't exist
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      studentName VARCHAR(255) NOT NULL,
      rollNo VARCHAR(50) NOT NULL,
      dept VARCHAR(100) NOT NULL,
      rating INT NOT NULL,
      primaryArea VARCHAR(100) NOT NULL,
      detailedFeedback TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("❌ Error automatically creating table:", err.message);
    } else {
      console.log("📊 'feedbacks' table is verified and ready inside the database!");
    }
  });
}

// ==========================================
// API ENDPOINTS FOR THE FEEDBACK SYSTEM
// ==========================================

// 1. POST /add-feedback (Called by feedback.html)
app.post('/add-feedback', (req, res) => {
  const { studentName, rollNo, dept, rating, primaryArea, detailedFeedback } = req.body;

  const insertQuery = `
    INSERT INTO feedbacks (studentName, rollNo, dept, rating, primaryArea, detailedFeedback)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery, 
    [studentName, rollNo, dept, rating, primaryArea, detailedFeedback], 
    (err, result) => {
      if (err) {
        console.error("SQL Error during feedback insertion:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.status(201).json({ success: true });
    }
  );
});

// 2. GET /feedbacks (Called by admin.html)
app.get('/feedbacks', (req, res) => {
  const selectQuery = "SELECT * FROM feedbacks ORDER BY created_at DESC";

  db.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("SQL Error during fetching feedbacks:", err);
      return res.status(500).json({ error: "Failed to fetch feedbacks" });
    }
    res.status(200).json(rows);
  });
});

// 3. DELETE /feedbacks/:id (Called by admin.html to delete a record)
app.delete('/feedbacks/:id', (req, res) => {
  const feedbackId = req.params.id;
  const deleteQuery = "DELETE FROM feedbacks WHERE id = ?";

  db.query(deleteQuery, [feedbackId], (err, result) => {
    if (err) {
      console.error("SQL Error during feedback deletion:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  });
});

// Robust fallbacks to make sure the HTML files load regardless of paths
app.get('/feedback.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedback.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the Server
app.listen(port, () => {
  console.log(`\n==================================================`);
  console.log(`🔥 Feedback Server is running at: http://localhost:${port}`);
  console.log(`📂 Web UI Panels:`);
  console.log(`   - Student Feedback: http://localhost:${port}/feedback.html`);
  console.log(`   - Admin Dashboard:  http://localhost:${port}/admin.html`);
  console.log(`==================================================\n`);
});
