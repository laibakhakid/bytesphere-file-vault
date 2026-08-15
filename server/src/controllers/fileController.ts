import { Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { FileModel } from '../models/File';
import { FileVersion } from '../models/FileVersion';
import { User } from '../models/User';
import { CryptoService } from '../services/cryptoService';
import { storageService } from '../services/storageService';
import { AIService } from '../services/aiService';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const uploadMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max upload limit per file
  },
});

export class FileController {
  public static async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const fileSize = req.file.size;

      // Quota check
      if (user.storageUsedBytes + fileSize > user.storageQuotaBytes) {
        await AuditService.log({
          req,
          userId,
          userEmail: user.email,
          action: 'ACCESS_DENIED',
          details: `Storage quota exceeded (Used: ${user.storageUsedBytes}, Limit: ${user.storageQuotaBytes})`,
          status: 'WARNING',
        });
        return res.status(400).json({ error: 'Storage quota exceeded. Please free up space.' });
      }

      const originalName = req.file.originalname;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const plainBuffer = req.file.buffer;

      // Compute original SHA-256 checksum
      const sha256Hash = CryptoService.calculateHash(plainBuffer);

      // Perform AES-256-GCM Envelope Encryption
      const encryptionResult = CryptoService.encryptBuffer(plainBuffer);

      // Unique storage key for local/S3 store
      const storageKey = `${userId}/${uuidv4()}_${sanitizedName}.enc`;

      // Save encrypted binary payload
      await storageService.saveEncryptedFile(storageKey, encryptionResult.encryptedData);

      // Extract content snippet for AI classification if plain text / doc
      let textSnippet = '';
      if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
        textSnippet = plainBuffer.toString('utf-8', 0, 3000);
      }

      // Run AI Document classification & security vulnerability check
      const aiResult = await AIService.analyzeDocument(originalName, mimeType, textSnippet, fileSize);

      // Create File DB record
      const fileDoc = await FileModel.create({
        originalName,
        sanitizedName,
        storageKey,
        sizeBytes: fileSize,
        mimeType,
        sha256Hash,
        ivHex: encryptionResult.ivHex,
        authTagHex: encryptionResult.authTagHex,
        encryptedDekHex: encryptionResult.encryptedDek.encryptedDekHex,
        dekIvHex: encryptionResult.encryptedDek.dekIvHex,
        dekAuthTagHex: encryptionResult.encryptedDek.dekAuthTagHex,
        owner: userId,
        tags: aiResult.tags,
        currentVersion: 1,
        aiClassification: aiResult.classification,
        aiSummary: aiResult.summary,
        aiRiskScore: aiResult.riskScore,
        aiSecurityAnalysis: aiResult.securityAnalysis,
      });

      // Create initial version record
      await FileVersion.create({
        fileId: fileDoc._id,
        versionNumber: 1,
        storageKey,
        sizeBytes: fileSize,
        mimeType,
        sha256Hash,
        ivHex: encryptionResult.ivHex,
        authTagHex: encryptionResult.authTagHex,
        encryptedDekHex: encryptionResult.encryptedDek.encryptedDekHex,
        dekIvHex: encryptionResult.encryptedDek.dekIvHex,
        dekAuthTagHex: encryptionResult.encryptedDek.dekAuthTagHex,
        createdBy: userId,
      });

      // Update user storage footprint
      user.storageUsedBytes += fileSize;
      await user.save();

      // Log immutable audit entry
      await AuditService.log({
        req,
        userId,
        userEmail: user.email,
        action: 'FILE_UPLOAD',
        details: `Uploaded & encrypted "${originalName}" (${(fileSize / 1024).toFixed(1)} KB) using AES-256-GCM`,
        resourceId: fileDoc._id.toString(),
        metadata: {
          mimeType,
          sizeBytes: fileSize,
          sha256Hash,
          aiClassification: aiResult.classification,
          riskScore: aiResult.riskScore,
        },
      });

      // If sensitive keywords or high risk score detected, trigger security warning alert
      if (aiResult.riskScore > 50) {
        await AuditService.log({
          req,
          userId,
          userEmail: user.email,
          action: 'SECURITY_ALERT',
          details: `Sensitive document detected: "${originalName}" (Risk Score: ${aiResult.riskScore}%). Contains sensitive keys, passwords, or credentials.`,
          status: 'WARNING',
          resourceId: fileDoc._id.toString(),
        });
      }

      return res.status(201).json({
        message: 'File encrypted and stored successfully',
        file: fileDoc,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'File upload failed: ' + error.message });
    }
  }

  public static async listFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { search, tag, page = '1', limit = '20' } = req.query;

      const filter: any = { owner: userId, isDeleted: false };

      if (search) {
        filter.$or = [
          { originalName: { $regex: search as string, $options: 'i' } },
          { aiClassification: { $regex: search as string, $options: 'i' } },
          { aiSummary: { $regex: search as string, $options: 'i' } },
        ];
      }

      if (tag) {
        filter.tags = tag as string;
      }

      const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const [files, total] = await Promise.all([
        FileModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        FileModel.countDocuments(filter),
      ]);

      return res.json({
        files,
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to list files: ' + error.message });
    }
  }

  public static async getFile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const fileId = req.params.id;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      return res.json({ file });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch file details' });
    }
  }

  public static async downloadFile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const fileId = req.params.id;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        await AuditService.log({
          req,
          userId,
          action: 'ACCESS_DENIED',
          details: `Attempted to download non-existent or unauthorized file ID: ${fileId}`,
          status: 'WARNING',
        });
        return res.status(404).json({ error: 'File not found or access denied' });
      }

      // Read encrypted binary payload
      const encryptedData = await storageService.getEncryptedFile(file.storageKey);

      // Perform AES-256-GCM Envelope Decryption
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

      // Verify data integrity with SHA-256
      const currentHash = CryptoService.calculateHash(plainBuffer);
      if (currentHash !== file.sha256Hash) {
        await AuditService.log({
          req,
          userId,
          userEmail: req.user?.email,
          action: 'SECURITY_ALERT',
          details: `Data integrity breach detected! Hash mismatch for file "${file.originalName}"`,
          status: 'FAILURE',
        });
        return res.status(500).json({ error: 'Data integrity check failed. File may be corrupted or tampered.' });
      }

      // Increment download counter
      file.downloadCount += 1;
      await file.save();

      // Log decryption audit entry
      await AuditService.log({
        req,
        userId,
        userEmail: req.user?.email,
        action: 'FILE_DECRYPTED',
        details: `Decrypted and downloaded "${file.originalName}" (Integrity Verified SHA-256)`,
        resourceId: file._id.toString(),
      });

      // Stream decrypted buffer to client
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      res.setHeader('Content-Length', plainBuffer.length);
      return res.send(plainBuffer);
    } catch (error: any) {
      return res.status(500).json({ error: 'File decryption failed: ' + error.message });
    }
  }

  public static async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const fileId = req.params.id;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      file.isDeleted = true;
      await file.save();

      // Delete storage binary
      await storageService.deleteEncryptedFile(file.storageKey);

      // Update user storage used bytes
      const user = await User.findById(userId);
      if (user) {
        user.storageUsedBytes = Math.max(0, user.storageUsedBytes - file.sizeBytes);
        await user.save();
      }

      await AuditService.log({
        req,
        userId,
        userEmail: req.user?.email,
        action: 'FILE_DELETED',
        details: `Deleted file "${file.originalName}"`,
        resourceId: file._id.toString(),
      });

      return res.json({ message: 'File deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to delete file: ' + error.message });
    }
  }

  public static async uploadNewVersion(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No new version file uploaded' });
      }

      const userId = req.user?.userId;
      const fileId = req.params.id;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const newBuffer = req.file.buffer;
      const newSizeBytes = req.file.size;
      const sha256Hash = CryptoService.calculateHash(newBuffer);

      // Encrypt new version payload
      const encryptionResult = CryptoService.encryptBuffer(newBuffer);
      const newVersionNum = file.currentVersion + 1;
      const storageKey = `${userId}/${uuidv4()}_v${newVersionNum}_${file.sanitizedName}.enc`;

      await storageService.saveEncryptedFile(storageKey, encryptionResult.encryptedData);

      // Create FileVersion record
      await FileVersion.create({
        fileId: file._id,
        versionNumber: newVersionNum,
        storageKey,
        sizeBytes: newSizeBytes,
        mimeType: file.mimeType,
        sha256Hash,
        ivHex: encryptionResult.ivHex,
        authTagHex: encryptionResult.authTagHex,
        encryptedDekHex: encryptionResult.encryptedDek.encryptedDekHex,
        dekIvHex: encryptionResult.encryptedDek.dekIvHex,
        dekAuthTagHex: encryptionResult.encryptedDek.dekAuthTagHex,
        createdBy: userId,
      });

      // Update main File record
      file.storageKey = storageKey;
      file.sizeBytes = newSizeBytes;
      file.sha256Hash = sha256Hash;
      file.ivHex = encryptionResult.ivHex;
      file.authTagHex = encryptionResult.authTagHex;
      file.encryptedDekHex = encryptionResult.encryptedDek.encryptedDekHex;
      file.dekIvHex = encryptionResult.encryptedDek.dekIvHex;
      file.dekAuthTagHex = encryptionResult.encryptedDek.dekAuthTagHex;
      file.currentVersion = newVersionNum;
      await file.save();

      await AuditService.log({
        req,
        userId,
        userEmail: req.user?.email,
        action: 'FILE_VERSION_UPLOADED',
        details: `Uploaded Version ${newVersionNum} for file "${file.originalName}"`,
        resourceId: file._id.toString(),
      });

      return res.json({ message: `Version ${newVersionNum} uploaded successfully`, file });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to upload version: ' + error.message });
    }
  }

  public static async getFileVersions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const fileId = req.params.id;

      const file = await FileModel.findOne({ _id: fileId, owner: userId, isDeleted: false });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const versions = await FileVersion.find({ fileId: file._id }).sort({ versionNumber: -1 }).lean();
      return res.json({ versions });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch version history' });
    }
  }

  public static async getQuotaStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const fileCount = await FileModel.countDocuments({ owner: userId, isDeleted: false });
      const recentFiles = await FileModel.find({ owner: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('originalName aiRiskScore aiClassification sizeBytes updatedAt');

      // Security health score calculation based on encryption & risks
      let securityScore = 100;
      if (recentFiles.some((f) => (f.aiRiskScore || 0) > 50)) {
        securityScore -= 15;
      }

      return res.json({
        storageQuotaBytes: user.storageQuotaBytes,
        storageUsedBytes: user.storageUsedBytes,
        usedPercentage: ((user.storageUsedBytes / user.storageQuotaBytes) * 100).toFixed(2),
        fileCount,
        securityScore,
        recentFiles,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve storage stats' });
    }
  }
}
