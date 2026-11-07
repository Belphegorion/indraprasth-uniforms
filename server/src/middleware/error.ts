import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error caught by central handler:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';

  // MongoDB / Mongoose connection errors
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('buffering timed out')
  ) {
    statusCode = 503;
    message = 'Database temporarily unavailable. Please verify MONGODB_URI configuration and network access.';
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    const issues = err.issues || err.errors || [];
    message = issues[0]?.message || 'Validation failed';
  }

  // Multer & File Upload Errors
  if (err.name === 'MulterError' || err.message?.includes('Invalid file type') || err.message?.includes('Only CSV')) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed limit (50 MB for videos, 5 MB for images, 10 MB for CSV)';
    } else {
      message = err.message || 'File upload error';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
