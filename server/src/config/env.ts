import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/filevault',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'super_secure_access_token_secret_32_bytes_long_key_2026',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    'super_secure_refresh_token_secret_32_bytes_long_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ENCRYPTION_MASTER_KEY:
    process.env.ENCRYPTION_MASTER_KEY ||
    'f8a42e5d6c7b8a90123456789abcdef0123456789abcdef0123456789abcdef0',
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || './uploads/encrypted',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
