const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * PostgreSQL Connection Pool Configuration using native 'pg' library
 *
 * NOTE: Pool is instantiated with environment variables, but does NOT attempt
 * an eager connection on module load or server startup. Connections are acquired
 * lazily per query. This ensures the Express server boots up cleanly and
 * endpoints like GET /api/health remain responsive even before PostgreSQL is running.
 */
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hotel_management',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

// Pool event listeners
pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Native parameterized query execution wrapper
 * @param {string} text - Parameterized SQL query (e.g. 'SELECT * FROM hotels WHERE id = $1')
 * @param {Array} params - Array of parameter values (e.g. [id])
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  return pool.query(text, params);
};

/**
 * Helper to test live database connection when PostgreSQL becomes available
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS current_time;');
    client.release();
    return {
      connected: true,
      time: res.rows[0].current_time,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
};

module.exports = {
  query,
  pool,
  testConnection,
};
