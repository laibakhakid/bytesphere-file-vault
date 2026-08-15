import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnecting = false;

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse existing connection (crucial for Serverless Vercel)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting && mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  isConnecting = true;

  try {
    mongoose.set('strictQuery', true);

    const options = {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    };

    logger.info(`Attempting database connection to: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, options);
    logger.info('Successfully connected to MongoDB database.');
  } catch (error: any) {
    logger.warn(`Primary MongoDB connection error: ${error.message}`);
    
    // Only attempt In-Memory fallback if in local development and not on serverless
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        logger.info(`Connected to In-Memory MongoDB Fallback at ${uri}`);
      } catch (memErr: any) {
        logger.error('In-memory fallback failed:', memErr.message);
      }
    } else {
      logger.error('Please configure MONGODB_URI in your Vercel Environment Variables to connect to your cloud database.');
    }
  } finally {
    isConnecting = false;
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
