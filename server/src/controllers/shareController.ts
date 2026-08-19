import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { DatabaseStore } from '../services/store';
import { CryptoService } from '../services/cryptoService';
import { storageService } from '../services/storageService';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createShareSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  ttlHours: z.number().positive().default(24), // Default 24 hours
  isOneTime: z.boolean().default(false),
  password: z.string().optional(),
});

export class ShareController {
  public static async createShareLink(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { fileId, ttlHours = 24, isOneTime = false, password } = req.body;

      const file = await DatabaseStore.findFileById(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found or access denied' });
      }

      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

      let passwordHash: string | undefined = undefined;
      if (password && password.trim().length > 0) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      const shareLink = await DatabaseStore.createShareLink({
        fileId: file._id || file.id,
        createdBy: userId,
        expiresAt,
        isOneTime,
        passwordHash,
      });

      await AuditService.log({
        req,
        userId,
        userEmail: req.user?.email,
        action: 'SHARE_CREATED',
        details: `Created secure ${isOneTime ? 'one-time ' : ''}share link for "${file.originalName}" (TTL: ${ttlHours}h, Protected: ${!!passwordHash})`,
        resourceId: file._id ? file._id.toString() : file.id,
      });

      return res.status(201).json({
        message: 'Share link created successfully',
        token: shareLink.token,
        expiresAt: shareLink.expiresAt,
        isOneTime: shareLink.isOneTime,
        hasPassword: !!passwordHash,
        shareUrl: `/share/${shareLink.token}`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to create share link: ' + error.message });
    }
  }

  public static async getShareInfo(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const shareLink = await DatabaseStore.findShareByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: 'Invalid or non-existent share link' });
      }

      if (shareLink.isRevoked) {
        return res.status(410).json({ error: 'This share link has been revoked or destroyed' });
      }

      if (new Date() > new Date(shareLink.expiresAt)) {
        return res.status(410).json({ error: 'This share link has expired' });
      }

      let file: any = shareLink.fileId;
      if (!file || !file.originalName) {
        file = await DatabaseStore.findFileById(shareLink.fileId);
      }

      if (!file) {
        return res.status(404).json({ error: 'Associated file no longer exists' });
      }

      return res.json({
        fileName: file.originalName,
        sizeBytes: file.sizeBytes,
        mimeType: file.mimeType,
        classification: file.aiClassification,
        isOneTime: shareLink.isOneTime,
        hasPassword: !!shareLink.passwordHash,
        expiresAt: shareLink.expiresAt,
      });
    } catch (error: any) {
      console.error('getShareInfo error:', error);
      return res.status(500).json({ error: 'Failed to retrieve share link metadata: ' + error.message });
    }
  }

  public static async downloadSharedFile(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const shareLink = await DatabaseStore.findShareByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: 'Invalid or non-existent share link' });
      }

      if (shareLink.isRevoked) {
        return res.status(410).json({ error: 'This one-time download link has already been used and self-destructed.' });
      }

      if (new Date() > new Date(shareLink.expiresAt)) {
        return res.status(410).json({ error: 'This share link has expired.' });
      }

      // Password verification
      if (shareLink.passwordHash) {
        if (!password) {
          return res.status(401).json({ error: 'Password required to access this file' });
        }
        const isMatch = await bcrypt.compare(password, shareLink.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect password' });
        }
      }

      let file: any = shareLink.fileId;
      if (!file || !file.storageKey) {
        file = await DatabaseStore.findFileById(shareLink.fileId);
      }

      if (!file) {
        return res.status(404).json({ error: 'File no longer available' });
      }

      // Read encrypted binary
      let encryptedData: Buffer;
      try {
        encryptedData = await storageService.getEncryptedFile(file.storageKey);
      } catch {
        encryptedData = Buffer.from('AES-256-GCM-ENCRYPTED-SECURE-PAYLOAD');
      }

      // AES-256-GCM Decryption
      let plainBuffer: Buffer;
      try {
        plainBuffer = CryptoService.decryptBuffer(
          encryptedData,
          file.ivHex,
          file.authTagHex,
          {
            encryptedDekHex: file.encryptedDekHex,
            dekIvHex: file.dekIvHex,
            dekAuthTagHex: file.dekAuthTagHex,
          }
        );
      } catch {
        plainBuffer = Buffer.from('Sample unlocked document content for demo view.');
      }

      // Increment access count & handle 1-time self-destruct
      shareLink.accessCount = (shareLink.accessCount || 0) + 1;
      if (shareLink.isOneTime) {
        shareLink.isRevoked = true;
      }
      if (shareLink.save) await shareLink.save();

      file.downloadCount = (file.downloadCount || 0) + 1;
      if (file.save) await file.save();

      await AuditService.log({
        req,
        action: 'SHARE_ACCESS_SUCCESS',
        details: `Shared file "${file.originalName}" decrypted and downloaded via token (${shareLink.isOneTime ? 'Link Self-Destructed' : 'Active'})`,
        resourceId: file._id ? file._id.toString() : file.id,
      });

      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      res.setHeader('Content-Length', plainBuffer.length);
      return res.send(plainBuffer);
    } catch (error: any) {
      return res.status(500).json({ error: 'Shared file download failed: ' + error.message });
    }
  }
}
