const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('./config/db');
const hotelRoutes = require('./routes/hotelRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed origins for CORS (including Vercel deployment, local testing, and custom domains)
const allowedOrigins = [
  'https://hotelmanagementiyvan.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Robust CORS middleware supporting mobile webviews, cross-origin browsers, and preflights
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback allow for general public API consumption
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  })
);

// Respond to all pre-flight OPTIONS requests
app.options('*', cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists and serve statically
const uploadsPath = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create uploads directory (may be in read-only environment):', e.message);
}
app.use('/uploads', express.static(uploadsPath));

// Health Check Endpoint - Useful for monitoring deployment and mobile connectivity
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const testResult = await db.query('SELECT NOW() AS current_time;');
    if (testResult?.rows?.length > 0) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GrandStay Hotel Management System API',
    database: {
      type: 'PostgreSQL (Native)',
      status: dbStatus,
      connection: process.env.DATABASE_URL ? 'Cloud Connection String' : `${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '5432'}`,
    },
    cors: {
      allowedOrigins,
    },
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
    try {
      await db.initDatabase();
    } catch (err) {
      console.error('Failed to initialize database on startup:', err.message);
    }
  });
}

module.exports = app;
