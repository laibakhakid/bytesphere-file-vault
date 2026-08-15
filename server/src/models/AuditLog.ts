import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'USER_REGISTER'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'FILE_UPLOAD'
  | 'FILE_DECRYPTED'
  | 'FILE_DELETED'
  | 'FILE_VERSION_UPLOADED'
  | 'SHARE_CREATED'
  | 'SHARE_ACCESS_SUCCESS'
  | 'SHARE_ACCESS_FAILED'
  | 'ACCESS_DENIED'
  | 'SECURITY_ALERT';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: AuditAction;
  details: string;
  ipAddress: string;
  userAgent: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true, index: true },
    details: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
