const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errorCode: err.code || 'SERVER_ERROR',
  });
};

module.exports = errorHandler;
