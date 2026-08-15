import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  sanitizedName: string;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  ivHex: string;
  authTagHex: string;
  encryptedDekHex: string;
  dekIvHex: string;
  dekAuthTagHex: string;
  owner: mongoose.Types.ObjectId;
  tags: string[];
  currentVersion: number;
  aiClassification?: string;
  aiSummary?: string;
  aiRiskScore?: number; // 0-100 security risk score
  aiSecurityAnalysis?: string;
  downloadCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    sanitizedName: { type: String, required: true },
    storageKey: { type: String, required: true, unique: true },
    sizeBytes: { type: Number, required: true },
    mimeType: { type: String, required: true },
    sha256Hash: { type: String, required: true },
    ivHex: { type: String, required: true },
    authTagHex: { type: String, required: true },
    encryptedDekHex: { type: String, required: true },
    dekIvHex: { type: String, required: true },
    dekAuthTagHex: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    currentVersion: { type: Number, default: 1 },
    aiClassification: { type: String, default: 'Unclassified' },
    aiSummary: { type: String, default: '' },
    aiRiskScore: { type: Number, default: 0 },
    aiSecurityAnalysis: { type: String, default: '' },
    downloadCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FileModel = mongoose.model<IFile>('File', FileSchema);
