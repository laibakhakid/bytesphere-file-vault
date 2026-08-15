import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

export interface EncryptedDEK {
  encryptedDekHex: string;
  dekIvHex: string;
  dekAuthTagHex: string;
}

export interface StreamEncryptionResult {
  ivHex: string;
  authTagHex: string;
  encryptedDek: EncryptedDEK;
  rawDek: Buffer;
}

export class CryptoService {
  private static masterKey: Buffer;

  private static getMasterKey(): Buffer {
    if (!this.masterKey) {
      let keyHex = env.ENCRYPTION_MASTER_KEY.trim();
      // Ensure master key is 32 bytes (64 hex characters)
      if (keyHex.length !== 64) {
        logger.warn('ENCRYPTION_MASTER_KEY is not 64 hex chars. Deriving 256-bit key via sha256...');
        keyHex = crypto.createHash('sha256').update(keyHex).digest('hex');
      }
      this.masterKey = Buffer.from(keyHex, 'hex');
    }
    return this.masterKey;
  }

  /**
   * Generates a random 256-bit Data Encryption Key (DEK)
   */
  public static generateDEK(): Buffer {
    return crypto.randomBytes(32);
  }

  /**
   * Envelope Encryption: Encrypts the Data Encryption Key (DEK) with the Master Key
   */
  public static encryptDEK(dek: Buffer): EncryptedDEK {
    const masterKey = this.getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

    const encryptedDek = Buffer.concat([cipher.update(dek), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedDekHex: encryptedDek.toString('hex'),
      dekIvHex: iv.toString('hex'),
      dekAuthTagHex: authTag.toString('hex'),
    };
  }

  /**
   * Envelope Decryption: Decrypts the DEK using the Master Key
   */
  public static decryptDEK(encryptedDek: EncryptedDEK): Buffer {
    const masterKey = this.getMasterKey();
    const iv = Buffer.from(encryptedDek.dekIvHex, 'hex');
    const authTag = Buffer.from(encryptedDek.dekAuthTagHex, 'hex');
    const ciphertext = Buffer.from(encryptedDek.encryptedDekHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
    decipher.setAuthTag(authTag);

    const dek = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return dek;
  }

  /**
   * Encrypts a Buffer using AES-256-GCM and a unique DEK
   */
  public static encryptBuffer(buffer: Buffer): {
    encryptedData: Buffer;
    ivHex: string;
    authTagHex: string;
    encryptedDek: EncryptedDEK;
  } {
    const dek = this.generateDEK();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);

    const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedDek = this.encryptDEK(dek);

    return {
      encryptedData,
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      encryptedDek,
    };
  }

  /**
   * Decrypts a Buffer using AES-256-GCM and its encrypted DEK
   */
  public static decryptBuffer(
    encryptedData: Buffer,
    ivHex: string,
    authTagHex: string,
    encryptedDek: EncryptedDEK
  ): Buffer {
    const dek = this.decryptDEK(encryptedDek);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }

  /**
   * Computes SHA-256 hash of data for integrity verification
   */
  public static calculateHash(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Creates an AES-256-GCM cipher stream for piping streaming uploads
   */
  public static createCipherStream(dek: Buffer, iv: Buffer): {
    cipher: crypto.CipherGCM;
    ivHex: string;
  } {
    const cipher = crypto.createCipheriv(ALGORITHM, dek, iv) as crypto.CipherGCM;
    return {
      cipher,
      ivHex: iv.toString('hex'),
    };
  }

  /**
   * Creates an AES-256-GCM decipher stream for piping streaming downloads
   */
  public static createDecipherStream(
    dek: Buffer,
    ivHex: string,
    authTagHex: string
  ): crypto.DecipherGCM {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);
    return decipher;
  }
}
