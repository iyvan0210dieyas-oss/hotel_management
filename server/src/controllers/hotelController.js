const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to safely delete an uploaded file
const deleteUploadedFile = (filename) => {
  if (!filename) return;
  // If it's a web URL, don't attempt to unlink
  if (filename.startsWith('http://') || filename.startsWith('https://')) return;

  const baseName = path.basename(filename);
  const filePath = path.join(__dirname, '../../uploads', baseName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`Could not delete file ${filePath}:`, unlinkErr.message);
        } else {
          console.log(`Deleted file: ${filePath}`);
        }
      });
    }
  });
};

/**
 * @route   GET /api/hotels
 * @desc    Get paginated hotels with search and price range filters using native SQL
 */
exports.getHotels = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, page = 1, limit = 6 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const offset = (pageNum - 1) * limitNum;

    // Build native parameterized query dynamically
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Search by title (case-insensitive)
    if (search && search.trim() !== '') {
      conditions.push(`title ILIKE $${paramIndex}`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Filter by min price
    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      conditions.push(`price >= $${paramIndex}`);
      values.push(Number(minPrice));
      paramIndex++;
    }

    // Filter by max price
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      conditions.push(`price <= $${paramIndex}`);
      values.push(Number(maxPrice));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Count query for total matching records
    const countQuery = `SELECT COUNT(*) AS total FROM hotels ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // 2. Data query with LIMIT and OFFSET
    const dataValues = [...values, limitNum, offset];
    const dataQuery = `
      SELECT id, title, description, price, latitude, longitude, image, created_at, updated_at
      FROM hotels
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const dataResult = await db.query(dataQuery, dataValues);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/hotels/:id
 * @desc    Get single hotel by ID using native SQL
 */
exports.getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, title, description, price, latitude, longitude, image, created_at, updated_at
      FROM hotels
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/hotels
 * @desc    Create new hotel with image upload using native SQL
 */
exports.createHotel = async (req, res, next) => {
  try {
    const { title, description, price, latitude, longitude } = req.body;

    // Field validations
    if (!title || title.trim().length < 3) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be at least 3 characters',
      });
    }

    if (!description || description.trim().length < 10) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Description is required and must be at least 10 characters',
      });
    }

    const priceStr = price !== undefined && price !== null ? String(price).trim() : '';
    const priceNum = Number(priceStr);
    if (!priceStr || isNaN(priceNum) || !Number.isFinite(priceNum) || priceNum <= 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'A valid price greater than 0 is required',
      });
    }

    const latNum = Number(latitude);
    if (latitude === undefined || isNaN(latNum) || latNum < -90 || latNum > 90) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90',
      });
    }

    const lngNum = Number(longitude);
    if (longitude === undefined || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180',
      });
    }

    const image = req.file ? req.file.filename : req.body.image;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Hotel image is required',
      });
    }

    const insertQuery = `
      INSERT INTO hotels (title, description, price, latitude, longitude, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const insertValues = [
      title.trim(),
      description.trim(),
      priceNum,
      latNum,
      lngNum,
      image,
    ];

    const result = await db.query(insertQuery, insertValues);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Hotel created successfully',
    });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    next(err);
  }
};

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel details and optionally replace image using native SQL
 */
exports.updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, latitude, longitude } = req.body;

    // Verify hotel exists
    const checkQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found`,
      });
    }

    const existingHotel = checkResult.rows[0];

    // Field validations
    if (title && title.trim().length < 3) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters',
      });
    }

    if (description && description.trim().length < 10) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters',
      });
    }

    let priceNum = existingHotel.price;
    if (price !== undefined && price !== null) {
      const priceStr = String(price).trim();
      priceNum = Number(priceStr);
      if (!priceStr || isNaN(priceNum) || !Number.isFinite(priceNum) || priceNum <= 0) {
        if (req.file) deleteUploadedFile(req.file.filename);
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0',
        });
      }
    }

    const latNum = latitude !== undefined ? Number(latitude) : existingHotel.latitude;
    if (latitude !== undefined && (isNaN(latNum) || latNum < -90 || latNum > 90)) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90',
      });
    }

    const lngNum = longitude !== undefined ? Number(longitude) : existingHotel.longitude;
    if (longitude !== undefined && (isNaN(lngNum) || lngNum < -180 || lngNum > 180)) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180',
      });
    }

    // Determine image: if new file uploaded, delete previous image file
    let finalImage = existingHotel.image;
    if (req.file) {
      finalImage = req.file.filename;
      // Delete old image file
      deleteUploadedFile(existingHotel.image);
    } else if (req.body.image) {
      finalImage = req.body.image;
    }

    const updateQuery = `
      UPDATE hotels
      SET
        title = $1,
        description = $2,
        price = $3,
        latitude = $4,
        longitude = $5,
        image = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const updateValues = [
      title ? title.trim() : existingHotel.title,
      description ? description.trim() : existingHotel.description,
      priceNum,
      latNum,
      lngNum,
      finalImage,
      id,
    ];

    const updateResult = await db.query(updateQuery, updateValues);

    res.json({
      success: true,
      data: updateResult.rows[0],
      message: 'Hotel updated successfully',
    });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    next(err);
  }
};

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete hotel and remove uploaded image file using native SQL
 */
exports.deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify hotel exists and get image filename
    const checkQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found`,
      });
    }

    const hotel = checkResult.rows[0];

    // Delete image file from uploads folder
    deleteUploadedFile(hotel.image);

    // Delete record from database
    const deleteQuery = `DELETE FROM hotels WHERE id = $1;`;
    await db.query(deleteQuery, [id]);

    res.json({
      success: true,
      message: 'Hotel deleted successfully',
      id: Number(id),
    });
  } catch (err) {
    next(err);
  }
};
