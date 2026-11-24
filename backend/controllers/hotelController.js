const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to safely delete an uploaded image file from the uploads directory
const deleteUploadedImage = (filename) => {
  if (!filename) return;
  // If it's a remote URL, do not attempt to delete local file
  if (filename.startsWith('http://') || filename.startsWith('https://')) return;

  const baseName = path.basename(filename);
  const filePath = path.join(__dirname, '../uploads', baseName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`Could not unlink image ${filePath}:`, unlinkErr.message);
        } else {
          console.log(`Deleted unlinked image: ${filePath}`);
        }
      });
    }
  });
};

/**
 * @route   GET /api/hotels
 * @desc    Get paginated hotel listings with search and price range filters using native SQL
 */
exports.getHotels = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, page = 1, limit = 6 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const offset = (pageNum - 1) * limitNum;

    // Dynamically build native parameterized WHERE conditions
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Search by title (case-insensitive parameterized ILIKE)
    if (search && search.trim() !== '') {
      conditions.push(`title ILIKE $${paramIndex}`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Filter by minimum price
    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      conditions.push(`price >= $${paramIndex}`);
      values.push(Number(minPrice));
      paramIndex++;
    }

    // Filter by maximum price
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      conditions.push(`price <= $${paramIndex}`);
      values.push(Number(maxPrice));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Native parameterized count query
    const countQuery = `SELECT COUNT(*) AS total FROM hotels ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // 2. Native parameterized data query with LIMIT and OFFSET
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
 * @desc    Get single hotel by primary key ID using native SQL
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
 * @desc    Create new hotel with uploaded image path using native SQL
 */
exports.createHotel = async (req, res, next) => {
  try {
    const { title, description, price, latitude, longitude } = req.body;

    // Determine image filename (store relative image path, NOT binary data)
    const imagePath = req.file ? req.file.filename : req.body.image;

    const insertQuery = `
      INSERT INTO hotels (title, description, price, latitude, longitude, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const insertValues = [
      title.trim(),
      description.trim(),
      Number(price),
      Number(latitude),
      Number(longitude),
      imagePath,
    ];

    const result = await db.query(insertQuery, insertValues);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Hotel created successfully',
    });
  } catch (err) {
    // If database insertion fails, remove uploaded file to prevent orphaned images
    if (req.file) {
      deleteUploadedImage(req.file.filename);
    }
    next(err);
  }
};

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel details and optionally replace image file using native SQL
 */
exports.updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, latitude, longitude } = req.body;

    // Check if hotel exists
    const checkQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      if (req.file) deleteUploadedImage(req.file.filename);
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found`,
      });
    }

    const existingHotel = checkResult.rows[0];

    // Determine new image path
    let finalImage = existingHotel.image;
    if (req.file) {
      finalImage = req.file.filename;
      // Remove old image file from disk if it was a local file
      deleteUploadedImage(existingHotel.image);
    } else if (req.body.image && req.body.image.trim() !== '') {
      finalImage = req.body.image.trim();
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
      title !== undefined ? title.trim() : existingHotel.title,
      description !== undefined ? description.trim() : existingHotel.description,
      price !== undefined ? Number(price) : existingHotel.price,
      latitude !== undefined ? Number(latitude) : existingHotel.latitude,
      longitude !== undefined ? Number(longitude) : existingHotel.longitude,
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
    if (req.file) {
      deleteUploadedImage(req.file.filename);
    }
    next(err);
  }
};

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete hotel record and associated image file using native SQL
 */
exports.deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hotel exists and obtain image path
    const checkQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${id} not found`,
      });
    }

    const hotel = checkResult.rows[0];

    // Delete image file from disk
    deleteUploadedImage(hotel.image);

    // Native parameterized DELETE query
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
