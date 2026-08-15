import { Response } from 'express';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuditController {
  public static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { action, status, page = '1', limit = '50' } = req.query;

      const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // If user is regular user, only view their own logs
      const result = await AuditService.getLogs({
        userId: req.user?.role === 'admin' ? undefined : userId,
        action: action as string,
        status: status as string,
        skip,
        limit: limitNum,
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve audit log feed: ' + error.message });
    }
  }
}
