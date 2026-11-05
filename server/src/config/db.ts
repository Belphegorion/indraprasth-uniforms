import mongoose from 'mongoose';
import { env } from './env';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = uri || env.MONGODB_URI;
  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error('❌ MongoDB connection error:', error);
      if (env.NODE_ENV !== 'test' && !process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });

  return cachedPromise;
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};
