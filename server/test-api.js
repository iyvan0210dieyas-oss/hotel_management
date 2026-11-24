const http = require('http');
const path = require('path');
const fs = require('fs');

// We can import app directly and test with supertest or node http
const app = require('./src/server');
const db = require('./src/config/db');

async function runTests() {
  const PORT = 5099;
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Test Server started on port ${PORT}`);
    
    // Ensure DB initialized
    await db.initDatabase();

    const baseUrl = `http://127.0.0.1:${PORT}`;

    try {
      // 1. Health check
      console.log('\n--- 1. Testing GET /api/health ---');
      const healthRes = await fetch(`${baseUrl}/api/health`).then(r => r.json());
      console.log('Health check response:', healthRes);
      if (healthRes.status !== 'healthy') throw new Error('Health check failed');

      // 2. GET /api/hotels
      console.log('\n--- 2. Testing GET /api/hotels (Listing & Pagination) ---');
      const listRes = await fetch(`${baseUrl}/api/hotels?page=1&limit=4`).then(r => r.json());
      console.log(`Retrieved ${listRes.data?.length} hotels. Total count: ${listRes.pagination?.total}`);
      if (!listRes.success || listRes.data.length === 0) throw new Error('GET /api/hotels failed');

      // 3. GET /api/hotels with Search
      console.log('\n--- 3. Testing GET /api/hotels (Search Filter) ---');
      const searchRes = await fetch(`${baseUrl}/api/hotels?search=Azure`).then(r => r.json());
      console.log(`Search result count: ${searchRes.data?.length}`);
      if (!searchRes.success || searchRes.data.length === 0) throw new Error('Search failed');
      console.log('Found hotel:', searchRes.data[0].title);

      // 4. GET /api/hotels with Price Filter
      console.log('\n--- 4. Testing GET /api/hotels (Price Range Filter) ---');
      const priceRes = await fetch(`${baseUrl}/api/hotels?minPrice=200&maxPrice=350`).then(r => r.json());
      console.log(`Hotels between $200 and $350 count: ${priceRes.data?.length}`);
      if (!priceRes.success) throw new Error('Price filter failed');

      // 5. GET /api/hotels/:id
      const firstHotelId = listRes.data[0].id;
      console.log(`\n--- 5. Testing GET /api/hotels/${firstHotelId} ---`);
      const singleRes = await fetch(`${baseUrl}/api/hotels/${firstHotelId}`).then(r => r.json());
      console.log('Single hotel title:', singleRes.data?.title);
      if (!singleRes.success || singleRes.data.id !== firstHotelId) throw new Error('GET single hotel failed');

      // 6. POST /api/hotels (Create Hotel)
      console.log('\n--- 6. Testing POST /api/hotels (Create Hotel) ---');
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const testImageName = 'test-hotel-suite.jpg';
      const testImagePath = path.join(__dirname, 'uploads', testImageName);
      fs.writeFileSync(testImagePath, 'fake image content for test');

      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="title"',
        '',
        'The Riviera Opal Luxury Suites',
        `--${boundary}`,
        'Content-Disposition: form-data; name="description"',
        '',
        'An opulent Mediterranean style coastal suite featuring private balconies and 5-star service.',
        `--${boundary}`,
        'Content-Disposition: form-data; name="price"',
        '',
        '310',
        `--${boundary}`,
        'Content-Disposition: form-data; name="latitude"',
        '',
        '43.7102',
        `--${boundary}`,
        'Content-Disposition: form-data; name="longitude"',
        '',
        '7.2620',
        `--${boundary}`,
        `Content-Disposition: form-data; name="image"; filename="${testImageName}"`,
        'Content-Type: image/jpeg',
        '',
        'fake image content for test',
        `--${boundary}--`,
      ].join('\r\n');

      const createRes = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
      }).then(r => r.json());

      console.log('Create hotel response:', createRes);
      if (!createRes.success || !createRes.data?.id) throw new Error('Create hotel failed');
      const createdId = createRes.data.id;

      // 7. PUT /api/hotels/:id (Update Hotel)
      console.log(`\n--- 7. Testing PUT /api/hotels/${createdId} (Update Hotel) ---`);
      const updateBody = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="title"',
        '',
        'The Riviera Opal Luxury Suites & Club',
        `--${boundary}`,
        'Content-Disposition: form-data; name="price"',
        '',
        '350',
        `--${boundary}--`,
      ].join('\r\n');

      const updateRes = await fetch(`${baseUrl}/api/hotels/${createdId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: updateBody,
      }).then(r => r.json());

      console.log('Update response:', updateRes);
      if (!updateRes.success || updateRes.data.title !== 'The Riviera Opal Luxury Suites & Club') {
        throw new Error('Update hotel failed');
      }

      // 8. DELETE /api/hotels/:id (Delete Hotel)
      console.log(`\n--- 8. Testing DELETE /api/hotels/${createdId} (Delete Hotel) ---`);
      const deleteRes = await fetch(`${baseUrl}/api/hotels/${createdId}`, {
        method: 'DELETE',
      }).then(r => r.json());

      console.log('Delete response:', deleteRes);
      if (!deleteRes.success) throw new Error('Delete hotel failed');

      // Verify deletion
      const verifyRes = await fetch(`${baseUrl}/api/hotels/${createdId}`);
      if (verifyRes.status !== 404) throw new Error('Deleted hotel should return 404');
      console.log('Verified 404 after deletion.');

      console.log('\n======================================================');
      console.log('🎉 ALL BACKEND API & CRUD TESTS PASSED WITH 100% SUCCESS!');
      console.log('======================================================\n');
      
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Test failed with error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
