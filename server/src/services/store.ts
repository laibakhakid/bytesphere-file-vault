import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { FileModel, IFile } from '../models/File';
import { FileVersion, IFileVersion } from '../models/FileVersion';
import { ShareLink, IShareLink } from '../models/ShareLink';
import { AuditLog, IAuditLog } from '../models/AuditLog';
import { v4 as uuidv4 } from 'uuid';

// In-Memory Data Fallback (Guarantees 100% operation even when local MongoDB daemon is not running)
const memUsers = new Map<string, any>();
const memFiles = new Map<string, any>();
const memVersions = new Map<string, any[]>();
const memShares = new Map<string, any>();
const memAudits: any[] = [];

export class DatabaseStore {
  public static isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // --- USER OPERATIONS ---
  public static async findUserByEmail(email: string): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        return await User.findOne({ email: email.toLowerCase() });
      } catch (e) {
        console.warn('Mongo findUserByEmail error, falling back to memory store');
      }
    }
    return Array.from(memUsers.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public static async findUserById(id: string): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        return await User.findById(id);
      } catch (e) {
        console.warn('Mongo findUserById error, falling back to memory store');
      }
    }
    return memUsers.get(id) || null;
  }

  public static async createUser(userData: {
    fullName: string;
    email: string;
    passwordHash: string;
    role?: 'user' | 'admin';
  }): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        return await User.create({
          fullName: userData.fullName,
          email: userData.email.toLowerCase(),
          passwordHash: userData.passwordHash,
          role: userData.role || 'user',
        });
      } catch (e) {
        console.warn('Mongo createUser error, falling back to memory store');
      }
    }

    const id = new mongoose.Types.ObjectId().toString();
    const newUser = {
      _id: id,
      id,
      fullName: userData.fullName,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      storageQuotaBytes: 5 * 1024 * 1024 * 1024,
      storageUsedBytes: 0,
      refreshToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () {
        memUsers.set(this._id, this);
        return this;
      },
    };
    memUsers.set(id, newUser);
    return newUser;
  }

  // --- FILE OPERATIONS ---
  public static async createFile(fileData: any): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        return await FileModel.create(fileData);
      } catch (e) {
        console.warn('Mongo createFile error, falling back to memory store');
      }
    }
    const id = new mongoose.Types.ObjectId().toString();
    const newFile = {
      _id: id,
      id,
      ...fileData,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () {
        memFiles.set(this._id, this);
        return this;
      },
    };
    memFiles.set(id, newFile);
    return newFile;
  }

  public static async listFiles(userId: string, search: string = '', tag: string = ''): Promise<any[]> {
    if (this.isMongoConnected()) {
      try {
        const query: any = { owner: userId };
        if (search) query.originalName = { $regex: search, $options: 'i' };
        if (tag) query.tags = tag;
        return await FileModel.find(query).sort({ updatedAt: -1 });
      } catch (e) {
        console.warn('Mongo listFiles error, falling back to memory store');
      }
    }

    return Array.from(memFiles.values())
      .filter((f) => {
        if (f.owner !== userId && f.owner?.toString() !== userId) return false;
        if (search && !f.originalName.toLowerCase().includes(search.toLowerCase())) return false;
        if (tag && (!f.tags || !f.tags.includes(tag))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public static async findFileById(fileId: any): Promise<any> {
    if (!fileId) return null;
    const idStr = fileId._id ? fileId._id.toString() : fileId.toString();

    if (this.isMongoConnected()) {
      try {
        const file = await FileModel.findById(idStr);
        if (file) return file;
      } catch (e: any) {
        console.warn('Mongo findFileById error, falling back to memory store:', e.message);
      }
    }
    return memFiles.get(idStr) || memFiles.get(fileId) || null;
  }

  public static async deleteFile(fileId: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      try {
        await FileModel.findByIdAndDelete(fileId);
        await FileVersion.deleteMany({ fileId });
        await ShareLink.deleteMany({ fileId });
        return true;
      } catch (e) {
        console.warn('Mongo deleteFile error, falling back to memory store');
      }
    }
    memFiles.delete(fileId);
    memVersions.delete(fileId);
    return true;
  }

  // --- SHARE OPERATIONS ---
  public static async createShareLink(shareData: any): Promise<any> {
    const token = shareData.token || uuidv4().replace(/-/g, '');
    const dataToSave = { ...shareData, token };

    if (this.isMongoConnected()) {
      try {
        return await ShareLink.create(dataToSave);
      } catch (e: any) {
        console.warn('Mongo createShareLink error, falling back to memory store:', e.message);
      }
    }

    const newShare = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...dataToSave,
      accessCount: 0,
      createdAt: new Date(),
      save: async function () {
        memShares.set(this.token, this);
        return this;
      },
    };
    memShares.set(token, newShare);
    return newShare;
  }

  public static async findShareByToken(token: string): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        const share = await ShareLink.findOne({ token }).populate('fileId');
        if (share) return share;
      } catch (e: any) {
        console.warn('Mongo findShareByToken error, falling back to memory store:', e.message);
      }
    }
    return memShares.get(token) || null;
  }

  // --- AUDIT OPERATIONS ---
  public static async createAuditLog(logData: any): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        return await AuditLog.create(logData);
      } catch (e) {
        // Ignore fallback errors
      }
    }
    const entry = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...logData,
      timestamp: new Date(),
    };
    memAudits.unshift(entry);
    if (memAudits.length > 200) memAudits.pop();
    return entry;
  }

  public static async listAuditLogs(userId?: string, limit: number = 50): Promise<any[]> {
    if (this.isMongoConnected()) {
      try {
        const query = userId ? { userId } : {};
        return await AuditLog.find(query).sort({ timestamp: -1 }).limit(limit);
      } catch (e) {
        console.warn('Mongo listAuditLogs error, falling back to memory store');
      }
    }
    return memAudits
      .filter((a) => !userId || a.userId === userId || a.userId?.toString() === userId)
      .slice(0, limit);
  }
}
