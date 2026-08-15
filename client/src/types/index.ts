export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  storageQuotaBytes: number;
  storageUsedBytes: number;
}

export interface FileItem {
  _id: string;
  originalName: string;
  sanitizedName: string;
  sizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  tags: string[];
  currentVersion: number;
  aiClassification?: string;
  aiSummary?: string;
  aiRiskScore?: number;
  aiSecurityAnalysis?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileVersion {
  _id: string;
  fileId: string;
  versionNumber: number;
  sizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  createdAt: string;
}

export interface ShareLink {
  token: string;
  fileId: string;
  expiresAt: string;
  isOneTime: boolean;
  hasPassword: boolean;
  shareUrl: string;
}

export interface AuditLogItem {
  _id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp: string;
}

export interface QuotaStats {
  storageQuotaBytes: number;
  storageUsedBytes: number;
  usedPercentage: string;
  fileCount: number;
  securityScore: number;
  recentFiles: FileItem[];
}
