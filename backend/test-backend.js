const http = require('http');
const { PassThrough } = require('stream');
const app = require('./server');
const db = require('./config/db');

// Helper to simulate HTTP requests through Express without network/socket boundaries
function makeRequest({ method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const socket = new PassThrough();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost', ...headers };

    const res = new http.ServerResponse(req);
    let responseData = '';

    res.write = function (chunk) {
      if (chunk) responseData += chunk.toString();
      return true;
    };

    res.end = function (chunk) {
      if (chunk) responseData += chunk.toString();
      let parsed = null;
      try {
        parsed = JSON.parse(responseData);
      } catch {
        parsed = responseData;
      }
      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: parsed,
      });
    };

    if (body) {
      const payload = typeof body === 'object' ? JSON.stringify(body) : String(body);
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      req.headers['content-length'] = Buffer.byteLength(payload);

      process.nextTick(() => {
        req.push(payload);
        req.push(null);
      });
    } else {
      process.nextTick(() => {
        req.push(null);
      });
    }

    app.handle(req, res);
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING EXPRESS BACKEND VERIFICATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  };

  // 1. Health Check Test
  await test('GET /api/health returns 200 OK with healthy status', async () => {
    const res = await makeRequest({ method: 'GET', url: '/api/health' });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (res.body.status !== 'healthy') throw new Error(`Expected status: 'healthy', got ${res.body.status}`);
    if (!res.body.timestamp) throw new Error('Missing timestamp in health response');
    console.log('   Health response:', JSON.stringify(res.body));
  });

  // 2. Static Uploads Test
  await test('GET /uploads/placeholder.txt serves static files with 200 OK', async () => {
    const res = await makeRequest({ method: 'GET', url: '/uploads/placeholder.txt' });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  // 3. Validation: Empty Body on POST /api/hotels
  await test('POST /api/hotels with empty body returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {},
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    if (!res.body.errors || res.body.errors.length === 0) throw new Error('Expected validation error array');
    console.log(`   Validation caught ${res.body.errors.length} missing field errors as expected.`);
  });

  // 4. Validation: Invalid Price (<= 0)
  await test('POST /api/hotels with negative price returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {
        title: 'Luxury Hotel',
        description: 'At least 10 characters description here.',
        price: -50,
        latitude: 40.7128,
        longitude: -74.006,
        image: 'hotel.jpg',
      },
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    const priceErr = res.body.errors?.find((e) => e.path === 'price');
    if (!priceErr) throw new Error('Expected price validation error for negative price');
    console.log(`   Price error message: "${priceErr.msg}"`);
  });

  // 5. Validation: Title too short (< 3 chars)
  await test('POST /api/hotels with title < 3 chars returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {
        title: 'Ab',
        description: 'At least 10 characters description here.',
        price: 199,
        latitude: 40.7128,
        longitude: -74.006,
        image: 'hotel.jpg',
      },
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    const titleErr = res.body.errors?.find((e) => e.path === 'title');
    if (!titleErr) throw new Error('Expected title validation error');
    console.log(`   Title error message: "${titleErr.msg}"`);
  });

  // 6. Validation: Description too short (< 10 chars)
  await test('POST /api/hotels with description < 10 chars returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {
        title: 'Grand Hotel',
        description: 'Short',
        price: 199,
        latitude: 40.7128,
        longitude: -74.006,
        image: 'hotel.jpg',
      },
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    const descErr = res.body.errors?.find((e) => e.path === 'description');
    if (!descErr) throw new Error('Expected description validation error');
    console.log(`   Description error message: "${descErr.msg}"`);
  });

  // 7. Validation: Latitude out of range (> 90)
  await test('POST /api/hotels with latitude > 90 returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {
        title: 'Grand Hotel',
        description: 'At least 10 characters description here.',
        price: 199,
        latitude: 95.5,
        longitude: -74.006,
        image: 'hotel.jpg',
      },
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    const latErr = res.body.errors?.find((e) => e.path === 'latitude');
    if (!latErr) throw new Error('Expected latitude validation error');
    console.log(`   Latitude error message: "${latErr.msg}"`);
  });

  // 8. Validation: Longitude out of range (> 180)
  await test('POST /api/hotels with longitude > 180 returns 400 Bad Request', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/hotels',
      body: {
        title: 'Grand Hotel',
        description: 'At least 10 characters description here.',
        price: 199,
        latitude: 40.7128,
        longitude: 195.0,
        image: 'hotel.jpg',
      },
    });
    if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    const lngErr = res.body.errors?.find((e) => e.path === 'longitude');
    if (!lngErr) throw new Error('Expected longitude validation error');
    console.log(`   Longitude error message: "${lngErr.msg}"`);
  });

  // 9. PostgreSQL Lazy Pool Check
  await test('PostgreSQL pool is configured properly without eager connection failure', async () => {
    if (!db.pool) throw new Error('PostgreSQL pool instance is not created');
    if (typeof db.query !== 'function') throw new Error('db.query is not a function');
    if (typeof db.testConnection !== 'function') throw new Error('db.testConnection is not a function');
    console.log('   PostgreSQL pool instance and query method ready for database launch.');
  });

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch(console.error);
