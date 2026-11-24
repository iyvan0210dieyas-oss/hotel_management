const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Helper to remove uploaded file if validation fails
const cleanupUploadedFile = (file) => {
  if (file && file.path) {
    fs.unlink(file.path, (err) => {
      if (err) console.warn('Could not clean up rejected file:', err.message);
    });
  }
};

// Validation rules for adding a hotel
const validateHotel = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Hotel title is required')
    .isLength({ min: 3 })
    .withMessage('Hotel title must be at least 3 characters long'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Hotel description is required')
    .isLength({ min: 10 })
    .withMessage('Hotel description must be at least 10 characters long'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a valid positive number greater than 0'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  // Validation response middleware
  (req, res, next) => {
    // In create mode, image file is required
    if (!req.file && (!req.body.image || req.body.image.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Hotel image is required',
        errors: [{ path: 'image', msg: 'Hotel image is required' }],
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation rules for updating a hotel (fields are optional, but if provided must be valid)
const validateHotelUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Hotel title must be at least 3 characters long'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Hotel description must be at least 10 characters long'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a valid positive number greater than 0'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  // Validation response middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateHotel,
  validateHotelUpdate,
};
