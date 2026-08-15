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

app.get('/api/health', (req, res) => {
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

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error in serverless handler:', err);
    }
  }
  return app(req, res);
}
