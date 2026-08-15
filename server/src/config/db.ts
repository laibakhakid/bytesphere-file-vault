import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from '../utils/logger';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    // Set short selection timeout to quickly fallback to memory server if local MongoDB isn't running
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    logger.info(`Attempting database connection to: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, options);
    logger.info('Successfully connected to Primary MongoDB database.');
  } catch (error) {
    logger.warn('Primary MongoDB connection failed or timed out. Initializing in-memory Mongo server fallback...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      logger.info(`Connected to In-Memory MongoDB Fallback at ${uri}`);
      logger.info('Zero-config Mode Active: App is fully functional without external MongoDB!');
    } catch (memError: any) {
      logger.error('Failed to start MongoMemoryServer fallback:', memError);
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
