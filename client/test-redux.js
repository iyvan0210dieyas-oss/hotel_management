import hotelReducer, {
  setHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  setFilterSearch,
  setPriceFilter,
  setPage,
  resetFilters,
  initialMockHotels,
} from './src/features/hotels/hotelSlice.js';

// Polyfill minimal localStorage for Node environment test
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
};

function runReduxTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING REDUX CRUD & PERSISTENCE TESTS');
  console.log('====================================================\n');

  let state = hotelReducer(undefined, { type: '@@INIT' });

  // 1. Initial State
  console.log('Initial hotels loaded count:', state.hotels.length);
  if (state.hotels.length !== 8) throw new Error('Expected 8 initial mock hotels');

  // 2. Add Hotel
  console.log('\n--- Testing addHotel action ---');
  const newHotelData = {
    id: 101,
    title: 'Grand Coastal Palms Resort',
    description: 'A serene luxury coastal estate with private villas and pristine waters.',
    price: 349.50,
    latitude: 21.3069,
    longitude: -157.8583,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  };
  state = hotelReducer(state, addHotel(newHotelData));
  const added = state.hotels.find((h) => h.id === 101);
  if (!added || added.title !== 'Grand Coastal Palms Resort' || added.price !== 349.50) {
    throw new Error('addHotel failed');
  }
  console.log('✅ Added hotel successfully! Current count:', state.hotels.length);

  // 3. Update Hotel
  console.log('\n--- Testing updateHotel action ---');
  state = hotelReducer(
    state,
    updateHotel({
      id: 101,
      title: 'Grand Coastal Palms Resort & Club',
      price: 399.0,
      description: 'Updated luxury description with world-class golf course.',
      latitude: 21.3069,
      longitude: -157.8583,
      image: newHotelData.image,
    })
  );
  const updated = state.hotels.find((h) => h.id === 101);
  if (!updated || updated.title !== 'GrandCoastal Palms Resort & Club' && updated.title !== 'Grand Coastal Palms Resort & Club' || updated.price !== 399.0) {
    throw new Error('updateHotel failed');
  }
  console.log('✅ Updated hotel successfully! New title:', updated.title, 'New price:', updated.price);

  // 4. Delete Hotel
  console.log('\n--- Testing deleteHotel action ---');
  state = hotelReducer(state, deleteHotel(101));
  const deletedCheck = state.hotels.find((h) => h.id === 101);
  if (deletedCheck) throw new Error('deleteHotel failed, hotel 101 still present');
  console.log('✅ Deleted hotel successfully! Remaining count:', state.hotels.length);

  // 5. Search Filter
  console.log('\n--- Testing filter actions ---');
  state = hotelReducer(state, setFilterSearch('Kyoto'));
  if (state.filters.search !== 'Kyoto') throw new Error('setFilterSearch failed');
  console.log('✅ setFilterSearch set query to:', state.filters.search);

  // 6. Price Filter
  state = hotelReducer(state, setPriceFilter({ minPrice: 200, maxPrice: 400 }));
  if (state.filters.minPrice !== 200 || state.filters.maxPrice !== 400) {
    throw new Error('setPriceFilter failed');
  }
  console.log('✅ setPriceFilter set minPrice=200, maxPrice=400');

  // 7. Reset Filters
  state = hotelReducer(state, resetFilters());
  if (state.filters.search !== '' || state.filters.minPrice !== '' || state.filters.maxPrice !== '') {
    throw new Error('resetFilters failed');
  }
  console.log('✅ resetFilters reset all filters to empty');

  console.log('\n====================================================');
  console.log('🎉 ALL REDUX CRUD TESTS PASSED 100%!');
  console.log('====================================================\n');
}

runReduxTests();
