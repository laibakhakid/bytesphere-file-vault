import { Router } from 'express';
import { ShareController, createShareSchema } from '../controllers/shareController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { shareLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protected link creation
router.post('/create', authenticateJWT, validateRequest(createShareSchema), ShareController.createShareLink);

// Public link verification and download
router.get('/info/:token', shareLimiter, ShareController.getShareInfo);
router.post('/download/:token', shareLimiter, ShareController.downloadSharedFile);

export default router;
