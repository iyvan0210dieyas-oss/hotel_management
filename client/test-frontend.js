import * as yup from 'yup';

// Mirroring Yup schema from HotelForm
const hotelValidationSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Hotel title is required')
    .min(3, 'Title must be at least 3 characters long'),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),
  price: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Price is required and must be a valid number')
    .required('Price is required')
    .positive('Please enter a valid price greater than 0')
    .min(0.01, 'Please enter a valid price greater than 0'),
  latitude: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Latitude is required and must be a valid number')
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Longitude is required and must be a valid number')
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING FRONTEND LOGIC & VALIDATION TESTS');
  console.log('====================================================\n');

  // Test 1: Valid positive integer price (199)
  console.log('--- Test 1: Valid integer price (199) ---');
  try {
    const validData = await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '199',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.log('✅ Passed validation with price 199. Parsed price:', validData.price);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }

  // Test 2: Valid positive decimal price (199.99)
  console.log('\n--- Test 2: Valid decimal price (199.99) ---');
  try {
    const validData = await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '199.99',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.log('✅ Passed validation with price 199.99. Parsed price:', validData.price);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }

  // Test 3: Empty price rejected
  console.log('\n--- Test 3: Reject empty price ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.error('❌ Empty price should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected empty price with error:', err.message);
  }

  // Test 4: Zero price rejected
  console.log('\n--- Test 4: Reject zero price ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '0',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.error('❌ Zero price should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected zero price with error:', err.message);
  }

  // Test 5: Negative price rejected
  console.log('\n--- Test 5: Reject negative price ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '-50',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.error('❌ Negative price should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected negative price with error:', err.message);
  }

  // Test 6: Short title (< 3 chars) rejected
  console.log('\n--- Test 6: Reject short title (< 3 chars) ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Ab',
      description: 'At least 10 characters long luxury description.',
      price: '199',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.error('❌ Short title should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected short title with error:', err.message);
  }

  // Test 7: Short description (< 10 chars) rejected
  console.log('\n--- Test 7: Reject short description (< 10 chars) ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'Short',
      price: '199',
      latitude: '25.7617',
      longitude: '-80.1918',
    });
    console.error('❌ Short description should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected short description with error:', err.message);
  }

  // Test 8: Latitude out of range rejected
  console.log('\n--- Test 8: Reject latitude > 90 ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '199',
      latitude: '95',
      longitude: '-80.1918',
    });
    console.error('❌ Out of bounds latitude should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected latitude > 90 with error:', err.message);
  }

  // Test 9: Longitude out of range rejected
  console.log('\n--- Test 9: Reject longitude > 180 ---');
  try {
    await hotelValidationSchema.validate({
      title: 'Grand Azure Suites',
      description: 'At least 10 characters long luxury description.',
      price: '199',
      latitude: '25.7617',
      longitude: '185',
    });
    console.error('❌ Out of bounds longitude should have been rejected!');
    process.exit(1);
  } catch (err) {
    console.log('✅ Correctly rejected longitude > 180 with error:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 9 FRONTEND VALIDATION TESTS PASSED 100%!');
  console.log('====================================================\n');
}

runTests();
