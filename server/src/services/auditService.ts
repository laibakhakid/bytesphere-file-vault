import { Request } from 'express';
import { DatabaseStore } from './store';
import { AuditAction } from '../models/AuditLog';
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
        params.req?.socket?.remoteAddress ||
        '127.0.0.1';

      const userAgent = params.req?.headers['user-agent'] || 'Unknown Client';

      await DatabaseStore.createAuditLog({
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
      // Ignore audit failure
    }
  }

  public static async getLogs(query: {
    userId?: string;
    action?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }) {
    const limit = query.limit || 50;
    const logs = await DatabaseStore.listAuditLogs(query.userId, limit);
    return { logs, total: logs.length, limit, skip: 0 };
  }
}
