const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('./config/db');
const hotelRoutes = require('./routes/hotelRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend Vite development
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GrandStay Hotel Management System API (Server)',
    port: PORT,
  });
});

// API Routes
app.use('/api/hotels', hotelRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🏨 GrandStay Hotel Management Server`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Uploads served from: ${uploadsPath}`);
    console.log(`=======================================================`);

    // Initialize Database
    await db.initDatabase();
  });
}

module.exports = app;
