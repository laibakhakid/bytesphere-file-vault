import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', AuditController.getAuditLogs);

export default router;
