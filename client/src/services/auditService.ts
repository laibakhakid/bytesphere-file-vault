import { api } from './api';
import { AuditLogItem } from '../types';

export class AuditService {
  public static async getAuditLogs(params?: {
    action?: string;
    status?: string;
    page?: number;
  }): Promise<{ logs: AuditLogItem[]; total: number }> {
    const res = await api.get('/audit', { params });
    return res.data;
  }
}
