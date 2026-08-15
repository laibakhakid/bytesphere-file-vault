import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnecting = false;

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse existing connection (crucial for Serverless Vercel)
  if ((mongoose.connection.readyState as number) === 1) {
    return;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting && (mongoose.connection.readyState as number) !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  isConnecting = true;

  try {
    mongoose.set('strictQuery', true);

    const options = {
      serverSelectionTimeoutMS: 2500,
      bufferCommands: false,
    };

    logger.info(`Attempting database connection to: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, options);
    logger.info('Successfully connected to MongoDB database.');
  } catch (error: any) {
    logger.warn(`Primary MongoDB connection error: ${error.message}. Using built-in resilient data store.`);
  } finally {
    isConnecting = false;
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
