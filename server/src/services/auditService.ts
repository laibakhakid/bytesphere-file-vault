import { Request } from 'express';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface AuditParams {
  req?: Request;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  details: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export class AuditService {
  public static async log(params: AuditParams): Promise<void> {
    try {
      const ipAddress =
        params.req?.headers['x-forwarded-for']?.toString().split(',')[0] ||
        params.req?.socket.remoteAddress ||
        '127.0.0.1';

      const userAgent = params.req?.headers['user-agent'] || 'Unknown Client';

      await AuditLog.create({
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        details: params.details,
        ipAddress,
        userAgent,
        resourceId: params.resourceId,
        metadata: params.metadata,
        status: params.status || 'SUCCESS',
        timestamp: new Date(),
      });

      logger.security(params.action, `${params.details} (IP: ${ipAddress})`);
    } catch (error) {
      logger.error('Failed to save audit log entry:', error);
    }
  }

  public static async getLogs(query: {
    userId?: string;
    action?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }) {
    const filter: any = {};
    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = query.action;
    if (query.status) filter.status = query.status;

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, limit, skip };
  }
}
