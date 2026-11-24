// Centralized Express Error Handling Middleware

const errorHandler = (err, req, res, next) => {
  console.error('⚠️ [Error Handler]:', err.message);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle custom file filter errors from Multer
  if (err.message && err.message.includes('Invalid image format')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle PostgreSQL connection/network errors gracefully
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '28P01' || err.code === '3D000') {
    return res.status(503).json({
      success: false,
      message: 'Database connection is currently unavailable. Please verify PostgreSQL is installed and running.',
      databaseError: err.code,
    });
  }

  // Generic internal server error
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
