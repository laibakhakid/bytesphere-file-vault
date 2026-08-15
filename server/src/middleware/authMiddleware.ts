import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuditService } from '../services/auditService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    AuditService.log({
      req,
      action: 'ACCESS_DENIED',
      details: 'Missing or malformed Authorization header',
      status: 'WARNING',
    });
    return res.status(401).json({ error: 'Authentication required. Bearer token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    AuditService.log({
      req,
      action: 'ACCESS_DENIED',
      details: 'Invalid or expired access token',
      status: 'WARNING',
    });
    return res.status(401).json({ error: 'Invalid or expired token. Please refresh or login again.' });
  }
};

export const requireRole = (role: 'admin' | 'user') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      AuditService.log({
        req,
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'ACCESS_DENIED',
        details: `Insufficient permissions. Required role: ${role}`,
        status: 'WARNING',
      });
      return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
};
