const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'hotel_management',
});

const sampleHotels = [
  {
    title: 'The Grand Azure Resort & Spa',
    description: 'Perched on the scenic cliffs with panoramic ocean views, featuring private infinity pools, world-class fine dining, and full-service wellness spa.',
    price: 380.00,
    latitude: 25.7617,
    longitude: -80.1918, // Miami
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Alpine Peak Luxury Chalet',
    description: 'An exclusive ski-in/ski-out alpine sanctuary nestled in snowy pine forests with heated outdoor hydrotherapy baths and private stone fireplaces.',
    price: 495.00,
    latitude: 45.9237,
    longitude: 6.8694, // Chamonix
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Manhattan Skyline Tower Suites',
    description: 'Ultra-modern penthouse suites boasting floor-to-ceiling glass walls with sweeping views of Central Park, 24/7 concierge, and rooftop lounge.',
    price: 320.00,
    latitude: 40.7580,
    longitude: -73.9855, // New York
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'The Royal Heritage Palace',
    description: 'Immerse yourself in authentic royal architecture with hand-carved marble courtyards, majestic peacocks, and bespoke private butler service.',
    price: 240.00,
    latitude: 26.9124,
    longitude: 75.7873, // Jaipur
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Santorini Sunset Cliffside Haven',
    description: 'Iconic whitewashed suites carved into volcanic caldera cliffs with private plunge pools overlooking the Aegean Sea and world-famous sunsets.',
    price: 420.00,
    latitude: 36.4618,
    longitude: 25.3753, // Santorini
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Kyoto Zen Garden Pavilion',
    description: 'A serene Japanese ryokan surrounded by thousand-year-old bamboo groves, mineral hot springs (onsen), and traditional kaiseki culinary dining.',
    price: 285.00,
    latitude: 35.0116,
    longitude: 135.7681, // Kyoto
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Marina Bay Waterfront Hotel',
    description: 'Spectacular waterfront luxury situated at the heart of the metropolis with sky garden, Michelin-starred cuisine, and direct marina access.',
    price: 195.00,
    latitude: 1.2838,
    longitude: 103.8591, // Singapore
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Emerald Bay Boutique Villa',
    description: 'Charming seaside boutique hideaway with private white sand beach, artisanal seafood dining, and tranquil tropical coconut palm gardens.',
    price: 150.00,
    latitude: 8.5379,
    longitude: 76.8770, // Kovalam
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
];

async function seedHotels() {
  try {
    console.log('Checking existing hotels in database...');
    const existing = await pool.query('SELECT COUNT(*) AS count FROM hotels');
    const count = parseInt(existing.rows[0].count, 10);

    if (count > 0) {
      console.log(`Database already has ${count} hotels. Skipping initial seed.`);
      process.exit(0);
    }

    console.log(`Seeding ${sampleHotels.length} luxury hotels using native parameterized SQL...`);

    for (const hotel of sampleHotels) {
      const query = `
        INSERT INTO hotels (title, description, price, latitude, longitude, image)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await pool.query(query, [
        hotel.title,
        hotel.description,
        hotel.price,
        hotel.latitude,
        hotel.longitude,
        hotel.image,
      ]);
    }

    console.log(' Successfully seeded all sample luxury hotels into PostgreSQL database!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding hotels:', err.message);
    process.exit(1);
  }
}

seedHotels();
