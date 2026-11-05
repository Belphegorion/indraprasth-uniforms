import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/error';

const app: Express = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Let frontend assets load comfortably across origins
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'https://indraprasth-uniforms.netlify.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

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

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all 404 & central error handler
app.use(notFound);
app.use(errorHandler);

export default app;
