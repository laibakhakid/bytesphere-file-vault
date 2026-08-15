import mongoose, { Schema, Document } from 'mongoose';

export interface IFileVersion extends Document {
  fileId: mongoose.Types.ObjectId;
  versionNumber: number;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  ivHex: string;
  authTagHex: string;
  encryptedDekHex: string;
  dekIvHex: string;
  dekAuthTagHex: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FileVersionSchema: Schema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    versionNumber: { type: Number, required: true },
    storageKey: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    mimeType: { type: String, required: true },
    sha256Hash: { type: String, required: true },
    ivHex: { type: String, required: true },
    authTagHex: { type: String, required: true },
    encryptedDekHex: { type: String, required: true },
    dekIvHex: { type: String, required: true },
    dekAuthTagHex: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const FileVersion = mongoose.model<IFileVersion>('FileVersion', FileVersionSchema);
