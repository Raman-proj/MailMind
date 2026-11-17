// A central error handler makes sure all errors are returned in a consistent format
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging

  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    // Only include stack trace if we're in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
