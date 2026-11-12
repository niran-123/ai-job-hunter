import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    },
    url: req.originalUrl,
    method: req.method
  }, 'API Error occurred');

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
};

