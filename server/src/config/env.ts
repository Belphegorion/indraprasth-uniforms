import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from server directory or root
dotenv.config();

const cleanStr = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.replace(/^["']|["']$/g, '').trim();
    }
    return val;
  }, schema);


const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: cleanStr(
    z
      .string()
      .default(
        'mongodb+srv://Vercel-Admin-atlas-bole-candle:a40i7Bz1r66uSegK@atlas-bole-candle.xohkesq.mongodb.net/indraprasth?retryWrites=true&w=majority'
      )
  ),
  JWT_SECRET: cleanStr(
    z.string().min(16).default('change-me-32-chars-long-secret-key-indraprasth-uniforms')
  ),
  COOKIE_DOMAIN: z
    .preprocess((val) => (typeof val === 'string' ? val.replace(/^["']|["']$/g, '').trim() : ''), z.string())
    .default(''),
  CLIENT_URL: cleanStr(z.string().default('http://localhost:5173')),
  CLOUDINARY_CLOUD_NAME: cleanStr(z.string().default('dvaynkflu')),
  CLOUDINARY_API_KEY: z
    .preprocess((val) => (typeof val === 'string' ? val.replace(/^["']|["']$/g, '').trim() : ''), z.string())
    .default(''),
  CLOUDINARY_API_SECRET: z
    .preprocess((val) => (typeof val === 'string' ? val.replace(/^["']|["']$/g, '').trim() : ''), z.string())
    .default(''),
  ADMIN_EMAIL: z
    .preprocess((val) => (typeof val === 'string' ? val.replace(/^["']|["']$/g, '').trim() : ''), z.string().email())
    .default('admin@indraprasth.com'),
  ADMIN_PASSWORD: cleanStr(z.string().min(6).default('Admin@123456')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : (envSchema.parse({}) as z.infer<typeof envSchema>);

