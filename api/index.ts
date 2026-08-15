import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../server/src/routes/authRoutes';
import fileRoutes from '../server/src/routes/fileRoutes';
import shareRoutes from '../server/src/routes/shareRoutes';
import auditRoutes from '../server/src/routes/auditRoutes';
import aiRoutes from '../server/src/routes/aiRoutes';
import { connectDB } from '../server/src/config/db';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'ByteSphere File Vault Serverless API',
    timestamp: new Date().toISOString(),
    security: {
      encryption: 'AES-256-GCM',
      envelopeEncryption: 'Enabled',
    },
  });
});

// Mount Routes with both /api prefix and root prefix (Guarantees matching regardless of Vercel path rewrite)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/files', fileRoutes);
app.use('/files', fileRoutes);

app.use('/api/share', shareRoutes);
app.use('/share', shareRoutes);

app.use('/api/audit', auditRoutes);
app.use('/audit', auditRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Fallback error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Serverless error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('DB connection error in serverless handler:', err);
    }
  }
  return app(req, res);
}
