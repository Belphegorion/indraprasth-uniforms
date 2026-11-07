import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/error';
import { connectDB } from './config/db';

const app: Express = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
        mediaSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
        connectSrc: ["'self'", 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'https://indraprasth-uniforms.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (
        env.NODE_ENV !== 'production' &&
        (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin.endsWith('.vercel.app'))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Health check endpoint (/health, /api/health, /api/v1/health) - immediately responsive without DB dependency
app.get(['/health', '/api/health', '/api/v1/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ensure MongoDB is connected for API invocations
app.use(async (req, _res, next) => {
  if (
    req.path === '/health' ||
    req.path === '/api/health' ||
    req.path === '/api/v1/health' ||
    req.path.startsWith('/uploads')
  ) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error in request lifecycle:', err);
    next(err);
  }
});

// Compression & parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mongo Sanitization to prevent NoSQL query injections
app.use(mongoSanitize());

// HTTP logging (quiet in test mode)
if (env.NODE_ENV !== 'test') {
  app.use(
    pinoHttp({
      autoLogging: true,
    })
  );
}

// Static uploads directory (for local file uploads and offline development only)
if (!process.env.VERCEL) {
  try {
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
  } catch (err) {
    console.warn('⚠️ Could not initialize local uploads directory:', err);
  }
}

// API Routes
app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all 404 & central error handler
app.use(notFound);
app.use(errorHandler);

export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

