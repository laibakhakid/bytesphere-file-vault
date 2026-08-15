import { api } from './api';
import { FileItem, FileVersion, QuotaStats } from '../types';

export class FileService {
  public static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ file: FileItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  }

  public static async listFiles(
    search: string = '',
    tag: string = '',
    page: number = 1
  ): Promise<{ files: FileItem[]; total: number; totalPages: number }> {
    const res = await api.get('/files', {
      params: { search, tag, page },
    });
    return res.data;
  }

  public static async downloadFile(fileId: string, fileName: string): Promise<void> {
    const res = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  public static async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/${fileId}`);
  }

  public static async uploadNewVersion(
    fileId: string,
    file: File
  ): Promise<{ file: FileItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/files/${fileId}/version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  public static async getFileVersions(fileId: string): Promise<FileVersion[]> {
    const res = await api.get(`/files/${fileId}/versions`);
    return res.data.versions;
  }

  public static async getQuotaStats(): Promise<QuotaStats> {
    const res = await api.get('/files/stats/quota');
    return res.data;
  }
}
