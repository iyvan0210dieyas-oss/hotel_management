const path = require('path');
const fs = require('fs');
const app = require('./src/server');
const db = require('./src/config/db');

// Frontend validation logic mirror for exact matching
function validateHotelForm({ title, description, price, latitude, longitude, hasImage, isEdit = false }) {
  const errors = {};

  const titleTrimmed = title ? String(title).trim() : '';
  if (!titleTrimmed) {
    errors.title = 'Title is required';
  } else if (titleTrimmed.length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  }

  const descTrimmed = description ? String(description).trim() : '';
  if (!descTrimmed) {
    errors.description = 'Description is required';
  } else if (descTrimmed.length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }

  const priceStr = price !== null && price !== undefined ? String(price).trim() : '';
  if (priceStr === '') {
    errors.price = 'Price is required';
  } else {
    const priceNum = Number(priceStr);
    if (isNaN(priceNum) || !Number.isFinite(priceNum) || priceNum <= 0) {
      errors.price = 'Please enter a valid price greater than 0';
    }
  }

  const latStr = latitude !== null && latitude !== undefined ? String(latitude).trim() : '';
  if (latStr === '') {
    errors.latitude = 'Latitude is required';
  } else {
    const latNum = Number(latStr);
    if (isNaN(latNum) || !Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      errors.latitude = 'Latitude must be a valid coordinate between -90 and 90';
    }
  }

  const lngStr = longitude !== null && longitude !== undefined ? String(longitude).trim() : '';
  if (lngStr === '') {
    errors.longitude = 'Longitude is required';
  } else {
    const lngNum = Number(lngStr);
    if (isNaN(lngNum) || !Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.longitude = 'Longitude must be a valid coordinate between -180 and 180';
    }
  }

  if (!isEdit && !hasImage) {
    errors.image = 'Hotel image is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

async function runValidationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE FORM & API VALIDATION TESTS');
  console.log('====================================================\n');

  // 1. Test Price Validation Unit Cases
  console.log('--- 1. Testing Price Validation Cases ---');

  // Case 1.1: Valid integer price (e.g. 199)
  const v1 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: '199', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Price = "199" -> error:', v1.errors.price, '(expected: undefined)');
  if (v1.errors.price) throw new Error('Valid integer 199 should not produce price error');

  // Case 1.2: Valid decimal price (e.g. 199.99)
  const v2 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: '199.99', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Price = "199.99" -> error:', v2.errors.price, '(expected: undefined)');
  if (v2.errors.price) throw new Error('Valid decimal 199.99 should not produce price error');

  // Case 1.3: Number type 199
  const v3 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: 199, latitude: 40.71, longitude: -74.00, hasImage: true });
  console.log('Price = 199 (numeric) -> error:', v3.errors.price, '(expected: undefined)');
  if (v3.errors.price) throw new Error('Valid numeric 199 should not produce price error');

  // Case 1.4: Empty string
  const v4 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: '', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Price = "" -> error:', v4.errors.price, '(expected: Price is required)');
  if (v4.errors.price !== 'Price is required') throw new Error('Empty price should produce "Price is required"');

  // Case 1.5: Zero price
  const v5 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: '0', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Price = "0" -> error:', v5.errors.price, '(expected: Please enter a valid price greater than 0)');
  if (!v5.errors.price) throw new Error('Zero price should be rejected');

  // Case 1.6: Negative price
  const v6 = validateHotelForm({ title: 'Luxury Hotel', description: 'At least 10 characters long description', price: '-50', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Price = "-50" -> error:', v6.errors.price, '(expected: Please enter a valid price greater than 0)');
  if (!v6.errors.price) throw new Error('Negative price should be rejected');

  // 2. Test Other Field Validations
  console.log('\n--- 2. Testing Other Field Validations ---');

  // Title < 3 characters
  const vTitle = validateHotelForm({ title: 'Ab', description: 'At least 10 characters long description', price: '199', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Title = "Ab" -> error:', vTitle.errors.title);
  if (!vTitle.errors.title) throw new Error('Short title should be rejected');

  // Description < 10 characters
  const vDesc = validateHotelForm({ title: 'Valid Title', description: 'Short', price: '199', latitude: '40.71', longitude: '-74.00', hasImage: true });
  console.log('Description = "Short" -> error:', vDesc.errors.description);
  if (!vDesc.errors.description) throw new Error('Short description should be rejected');

  // Latitude out of range
  const vLat = validateHotelForm({ title: 'Valid Title', description: 'Valid description text here', price: '199', latitude: '95', longitude: '-74.00', hasImage: true });
  console.log('Latitude = "95" -> error:', vLat.errors.latitude);
  if (!vLat.errors.latitude) throw new Error('Latitude > 90 should be rejected');

  // Longitude out of range
  const vLng = validateHotelForm({ title: 'Valid Title', description: 'Valid description text here', price: '199', latitude: '40.71', longitude: '190', hasImage: true });
  console.log('Longitude = "190" -> error:', vLng.errors.longitude);
  if (!vLng.errors.longitude) throw new Error('Longitude > 180 should be rejected');

  // Image missing
  const vImg = validateHotelForm({ title: 'Valid Title', description: 'Valid description text here', price: '199', latitude: '40.71', longitude: '-74.00', hasImage: false });
  console.log('Image = false -> error:', vImg.errors.image);
  if (!vImg.errors.image) throw new Error('Missing image should be rejected in Add mode');

  console.log('All frontend validation unit checks PASSED!');

  // 3. Test Real Backend API Integration
  console.log('\n--- 3. Testing Backend API Integration with Price 199 and Decimal 199.99 ---');
  const PORT = 5098;
  const server = app.listen(PORT, async () => {
    await db.initDatabase();
    const baseUrl = `http://127.0.0.1:${PORT}`;

    try {
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const testImageName = 'test-hotel-val.jpg';
      const testImagePath = path.join(__dirname, 'uploads', testImageName);
      fs.writeFileSync(testImagePath, 'fake image content for test');

      const createPayload = (priceVal) => [
        `--${boundary}`,
        'Content-Disposition: form-data; name="title"',
        '',
        'The Grand Horizon Luxury Suites',
        `--${boundary}`,
        'Content-Disposition: form-data; name="description"',
        '',
        'A magnificent luxury getaway hotel with pristine coastal views.',
        `--${boundary}`,
        'Content-Disposition: form-data; name="price"',
        '',
        String(priceVal),
        `--${boundary}`,
        'Content-Disposition: form-data; name="latitude"',
        '',
        '25.7617',
        `--${boundary}`,
        'Content-Disposition: form-data; name="longitude"',
        '',
        '-80.1918',
        `--${boundary}`,
        `Content-Disposition: form-data; name="image"; filename="${testImageName}"`,
        'Content-Type: image/jpeg',
        '',
        'fake image content for test',
        `--${boundary}--`,
      ].join('\r\n');

      // Test 3.1: POST with price = 199
      console.log('Testing POST /api/hotels with price = 199...');
      const res199 = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: createPayload(199),
      });
      const data199 = await res199.json();
      console.log('Response for price 199:', res199.status, data199.message, 'saved price:', data199.data?.price);
      if (res199.status !== 201 || Number(data199.data.price) !== 199) {
        throw new Error('POST with price 199 failed');
      }

      // Test 3.2: POST with decimal price = 199.99
      console.log('Testing POST /api/hotels with decimal price = 199.99...');
      const resDecimal = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: createPayload(199.99),
      });
      const dataDecimal = await resDecimal.json();
      console.log('Response for price 199.99:', resDecimal.status, dataDecimal.message, 'saved price:', dataDecimal.data?.price);
      if (resDecimal.status !== 201 || Number(dataDecimal.data.price) !== 199.99) {
        throw new Error('POST with decimal price 199.99 failed');
      }

      // Test 3.3: POST with price = 0 (Must reject with 400)
      console.log('Testing POST /api/hotels with price = 0 (Should be rejected)...');
      const resZero = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: createPayload(0),
      });
      const dataZero = await resZero.json();
      console.log('Response for price 0:', resZero.status, dataZero.message);
      if (resZero.status !== 400) {
        throw new Error('POST with price 0 should return 400');
      }

      // Test 3.4: POST with negative price = -50 (Must reject with 400)
      console.log('Testing POST /api/hotels with price = -50 (Should be rejected)...');
      const resNeg = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: createPayload(-50),
      });
      const dataNeg = await resNeg.json();
      console.log('Response for price -50:', resNeg.status, dataNeg.message);
      if (resNeg.status !== 400) {
        throw new Error('POST with price -50 should return 400');
      }

      console.log('\n====================================================');
      console.log('🎉 ALL VALIDATION & API INTEGRATION TESTS PASSED 100%!');
      console.log('====================================================\n');

      if (server.closeAllConnections) {
        server.closeAllConnections();
      }
      server.close();
    } catch (err) {
      console.error('Validation test failed:', err);
      if (server.closeAllConnections) {
        server.closeAllConnections();
      }
      server.close();
    }
  });
}

runValidationTests();
