const express = require('express');
const router = express.Router();

const hotelController = require('../controllers/hotelController');
const upload = require('../middleware/upload');
const { validateHotel, validateHotelUpdate } = require('../middleware/validateHotel');

// Route Declarations

// GET /api/hotels - Search, filter, and paginate hotels
router.get('/', hotelController.getHotels);

// GET /api/hotels/:id - Retrieve single hotel by ID
router.get('/:id', hotelController.getHotelById);

// POST /api/hotels - Create new hotel with image upload and validation
router.post(
  '/',
  upload.single('image'),
  validateHotel,
  hotelController.createHotel
);

// PUT /api/hotels/:id - Update hotel with optional image replacement
router.put(
  '/:id',
  upload.single('image'),
  validateHotelUpdate,
  hotelController.updateHotel
);

// DELETE /api/hotels/:id - Delete hotel record & remove image file
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
