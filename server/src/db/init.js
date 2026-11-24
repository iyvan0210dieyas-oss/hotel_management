const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function initDB() {
  const dbName = process.env.DB_NAME || 'hotel_management';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);

  console.log(`Connecting to PostgreSQL host ${dbHost}:${dbPort}...`);

  // Step 1: Connect to default postgres DB to check / create the target database
  const adminClient = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('Connected to default postgres database.');

    // Check if target database exists
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it now...`);
      // CREATE DATABASE cannot be run in a transaction block or parameterized with $1
      await adminClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`Admin connection warning: ${err.message}`);
  } finally {
    await adminClient.end();
  }

  // Step 2: Connect to the target hotel_management database and create the hotels table
  const appClient = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: dbName,
  });

  try {
    await appClient.connect();
    console.log(`Connected to target database "${dbName}".`);

    const schemaSql = `
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
        latitude NUMERIC(10, 6) NOT NULL,
        longitude NUMERIC(10, 6) NOT NULL,
        image VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels (title);
      CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
    `;

    await appClient.query(schemaSql);
    console.log('Table "hotels" and indexes initialized successfully.');
  } catch (err) {
    console.error(`Error initializing schema in "${dbName}":`, err.message);
  } finally {
    await appClient.end();
    console.log('Database initialization process finished.');
  }
}

initDB().catch(console.error);
