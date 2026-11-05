import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from server directory or root
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/indraprasth'),
  JWT_SECRET: z.string().min(16).default('change-me-32-chars-long-secret-key-indraprasth-uniforms'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().default('dvaynkflu'),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().email().default('admin@indraprasth.com'),
  ADMIN_PASSWORD: z.string().min(6).default('Admin@123456'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
