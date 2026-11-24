const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const hotelRoutes = require('./routes/hotelRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (allow requests from frontend)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// GET /api/health - Service health check (independent of live database)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GrandStay Hotel Management API',
    environment: process.env.NODE_ENV || 'development',
    database: 'PostgreSQL connection pool configured (lazy connect)',
  });
});

// Mount Hotel API Routes
app.use('/api/hotels', hotelRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Express Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('=======================================================');
    console.log('🏨 GrandStay Hotel Management Backend Server');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Static uploads path: ${uploadsPath}`);
    console.log(`🩺 Health check URL: http://localhost:${PORT}/api/health`);
    console.log('🐘 PostgreSQL pool: Configured (ready for connection)');
    console.log('=======================================================');
  });
}

module.exports = app;
