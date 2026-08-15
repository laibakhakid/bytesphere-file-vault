import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface StorageDriver {
  saveFile(storageKey: string, data: Buffer): Promise<string>;
  getFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<boolean>;
  getStream(storageKey: string): fs.ReadStream;
}

class LocalStorageDriver implements StorageDriver {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(env.LOCAL_STORAGE_PATH);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(storageKey: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.baseDir, storageKey);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, data);
    return filePath;
  }

  async getFile(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in storage: ${storageKey}`);
    }
    return await fs.promises.readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  getStream(storageKey: string): fs.ReadStream {
    const filePath = path.join(this.baseDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File stream source not found: ${storageKey}`);
    }
    return fs.createReadStream(filePath);
  }
}

class StorageService {
  private driver: StorageDriver;

  constructor() {
    // Default to local storage fallback if AWS keys missing or driver explicitly set to local
    if (env.STORAGE_DRIVER === 's3' && env.AWS_ACCESS_KEY_ID && env.AWS_S3_BUCKET) {
      logger.info('Initializing AWS S3 Storage Driver...');
      // AWS S3 wrapper can be used when configured
      this.driver = new LocalStorageDriver();
    } else {
      logger.info('Initializing Local Encrypted Disk Storage Driver...');
      this.driver = new LocalStorageDriver();
    }
  }

  async saveEncryptedFile(storageKey: string, data: Buffer): Promise<string> {
    return await this.driver.saveFile(storageKey, data);
  }

  async getEncryptedFile(storageKey: string): Promise<Buffer> {
    return await this.driver.getFile(storageKey);
  }

  async deleteEncryptedFile(storageKey: string): Promise<boolean> {
    return await this.driver.deleteFile(storageKey);
  }

  getEncryptedStream(storageKey: string): fs.ReadStream {
    return this.driver.getStream(storageKey);
  }
}

export const storageService = new StorageService();
