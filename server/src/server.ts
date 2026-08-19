import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import fileRoutes from './routes/fileRoutes';
import shareRoutes from './routes/shareRoutes';
import auditRoutes from './routes/auditRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON & URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Secure File Vault Backend',
    timestamp: new Date().toISOString(),
    security: {
      encryption: 'AES-256-GCM',
      envelopeEncryption: 'Enabled',
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

import os from 'os';

const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const startServer = async () => {
  await connectDB();
  const localIp = getLocalIP();
  
  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`====================================================`);
    logger.info(`🛡️  Vault Backend API Server Active`);
    logger.info(`➜  Local:   http://localhost:${env.PORT}/api/health`);
    logger.info(`➜  Network: http://${localIp}:${env.PORT}/api/health`);
    logger.info(`➜  Client:  http://localhost:5173 / http://${localIp}:5173`);
    logger.info(`➜  Storage: ${env.STORAGE_DRIVER.toUpperCase()} (AES-256-GCM Envelope Encryption)`);
    logger.info(`====================================================`);
  });
};

startServer();

