const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Sample initial luxury hotels
const initialHotels = [
  {
    title: 'The Grand Azure Resort & Spa',
    description: 'Perched on scenic cliffs with panoramic ocean views, private infinity pools, world-class fine dining, and full-service wellness spa.',
    price: 380.0,
    latitude: 25.7617,
    longitude: -80.1918,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Alpine Peak Luxury Chalet',
    description: 'An exclusive ski-in/ski-out alpine sanctuary nestled in snowy pine forests with heated outdoor hydrotherapy baths and private stone fireplaces.',
    price: 495.0,
    latitude: 45.9237,
    longitude: 6.8694,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Manhattan Skyline Tower Suites',
    description: 'Ultra-modern penthouse suites boasting floor-to-ceiling glass walls with sweeping views of Central Park, 24/7 concierge, and rooftop lounge.',
    price: 320.0,
    latitude: 40.758,
    longitude: -73.9855,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'The Royal Heritage Palace',
    description: 'Immerse yourself in authentic royal architecture with hand-carved marble courtyards, majestic peacocks, and bespoke private butler service.',
    price: 240.0,
    latitude: 26.9124,
    longitude: 75.7873,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Santorini Sunset Cliffside Haven',
    description: 'Iconic whitewashed suites carved into volcanic caldera cliffs with private plunge pools overlooking the Aegean Sea and world-famous sunsets.',
    price: 420.0,
    latitude: 36.4618,
    longitude: 25.3753,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Kyoto Zen Garden Pavilion',
    description: 'A serene Japanese ryokan surrounded by thousand-year-old bamboo groves, mineral hot springs (onsen), and traditional kaiseki culinary dining.',
    price: 285.0,
    latitude: 35.0116,
    longitude: 135.7681,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Marina Bay Waterfront Hotel',
    description: 'Spectacular waterfront luxury situated at the heart of the metropolis with sky garden, Michelin-starred cuisine, and direct marina access.',
    price: 195.0,
    latitude: 1.2838,
    longitude: 103.8591,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Emerald Bay Boutique Villa',
    description: 'Charming seaside boutique hideaway with private white sand beach, artisanal seafood dining, and tranquil tropical coconut palm gardens.',
    price: 150.0,
    latitude: 8.5379,
    longitude: 76.877,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
];

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    image VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'hotel_management',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
});

// Auto-initialize DB connection and ensure table exists in real PostgreSQL
async function initDatabase() {
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);

    // If table is completely empty, optionally seed initial hotels
    const countResult = await client.query('SELECT COUNT(*) AS total FROM hotels;');
    const count = parseInt(countResult.rows[0].total, 10);
    if (count === 0) {
      for (const h of initialHotels) {
        await client.query(
          'INSERT INTO hotels (title, description, price, latitude, longitude, image) VALUES ($1, $2, $3, $4, $5, $6);',
          [h.title, h.description, h.price, h.latitude, h.longitude, h.image]
        );
      }
      console.log(`✅ Seeded ${initialHotels.length} initial hotels into real PostgreSQL database.`);
    }

    client.release();
    console.log('✅ Successfully connected to native PostgreSQL database!');
    console.log(`📊 Database: ${process.env.DB_NAME || 'hotel_management'} on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '5432'}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to connect to native PostgreSQL: ${err.message}`);
    throw err;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDatabase,
  isUsingMemoryFallback: () => false,
};
