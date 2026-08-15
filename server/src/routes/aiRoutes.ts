import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.post('/analyze/:fileId', AIController.analyzeFile);

export default router;
