const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const upload = require('../middleware/upload');

// Hotel Routes
// GET /api/hotels - Search, filter, paginate
router.get('/', hotelController.getHotels);

// GET /api/hotels/:id - Get single hotel
router.get('/:id', hotelController.getHotelById);

// POST /api/hotels - Create new hotel with image upload
router.post('/', upload.single('image'), hotelController.createHotel);

// PUT /api/hotels/:id - Update hotel with optional image replacement
router.put('/:id', upload.single('image'), hotelController.updateHotel);

// DELETE /api/hotels/:id - Delete hotel & remove image
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
