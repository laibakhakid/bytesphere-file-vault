import { api } from './api';
import { ShareLink } from '../types';

export class ShareService {
  public static async createShareLink(params: {
    fileId: string;
    ttlHours: number;
    isOneTime: boolean;
    password?: string;
  }): Promise<ShareLink> {
    const res = await api.post('/share/create', params);
    return res.data;
  }

  public static async getShareInfo(token: string): Promise<{
    fileName: string;
    sizeBytes: number;
    mimeType: string;
    classification: string;
    isOneTime: boolean;
    hasPassword: boolean;
    expiresAt: string;
  }> {
    const res = await api.get(`/share/info/${token}`);
    return res.data;
  }

  public static async downloadSharedFile(token: string, password?: string): Promise<void> {
    const res = await api.post(`/share/download/${token}`, { password }, { responseType: 'blob' });

    // Extract filename from header if present or fallback
    let fileName = 'decrypted_vault_file';
    const disposition = res.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
      }
    }

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
