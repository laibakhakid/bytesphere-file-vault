import { Response } from 'express';
import { FileModel } from '../models/File';
import { CryptoService } from '../services/cryptoService';
import { storageService } from '../services/storageService';
import { AIService } from '../services/aiService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AIController {
  public static async analyzeFile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const fileId = req.params.fileId;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Read encrypted file payload
      const encryptedData = await storageService.getEncryptedFile(file.storageKey);

      // Decrypt in memory for analysis
      const plainBuffer = CryptoService.decryptBuffer(
        encryptedData,
        file.ivHex,
        file.authTagHex,
        {
          encryptedDekHex: file.encryptedDekHex,
          dekIvHex: file.dekIvHex,
          dekAuthTagHex: file.dekAuthTagHex,
        }
      );

      let textSnippet = '';
      if (file.mimeType.startsWith('text/') || file.mimeType.includes('json') || file.mimeType.includes('xml')) {
        textSnippet = plainBuffer.toString('utf-8', 0, 3000);
      }

      const aiResult = await AIService.analyzeDocument(file.originalName, file.mimeType, textSnippet, file.sizeBytes);

      // Update file document with new AI insights
      file.aiClassification = aiResult.classification;
      file.tags = Array.from(new Set([...file.tags, ...aiResult.tags]));
      file.aiSummary = aiResult.summary;
      file.aiRiskScore = aiResult.riskScore;
      file.aiSecurityAnalysis = aiResult.securityAnalysis;
      await file.save();

      return res.json({
        message: 'AI document analysis updated',
        aiResult,
        file,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'AI analysis failed: ' + error.message });
    }
  }
}
