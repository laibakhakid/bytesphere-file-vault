import mongoose, { Schema, Document } from 'mongoose';

export interface IShareLink extends Document {
  token: string;
  fileId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  isOneTime: boolean;
  accessCount: number;
  maxAccesses?: number;
  passwordHash?: string;
  isRevoked: boolean;
  createdAt: Date;
}

const ShareLinkSchema: Schema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    isOneTime: { type: Boolean, default: false },
    accessCount: { type: Number, default: 0 },
    maxAccesses: { type: Number },
    passwordHash: { type: String },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ShareLink = mongoose.model<IShareLink>('ShareLink', ShareLinkSchema);
