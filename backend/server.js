const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const hotelRoutes = require('./routes/hotelRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'https://hotelmanagementiyvan.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS configuration (allow requests from Vercel and local dev)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  })
);

app.options('*', cors());

// Express JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// GET /api/health - Service health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hotel Management System Backend API',
    port: PORT,
  });
});

// Mount Hotel CRUD API routes
app.use('/api/hotels', hotelRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏨 Hotel Management System Backend running on port ${PORT}`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Static uploads directory: ${uploadsPath}`);
    console.log(`🩺 Health check URL: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
