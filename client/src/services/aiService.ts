import { api } from './api';
import { FileItem } from '../types';

export class AIService {
  public static async analyzeFile(fileId: string): Promise<{ file: FileItem; aiResult: any }> {
    const res = await api.post(`/ai/analyze/${fileId}`);
    return res.data;
  }
}
