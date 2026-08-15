import { Router } from 'express';
import { AuthController, registerSchema, loginSchema } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticateJWT, AuthController.logout);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
