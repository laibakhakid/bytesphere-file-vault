import React, { useState, useEffect, useRef } from 'react';
import { X, History, UploadCloud, Download, CheckCircle2, RefreshCw, Copy, Check } from 'lucide-react';
import { FileService } from '../services/fileService';
import { useToast } from '../context/ToastContext';
import { FileItem, FileVersion } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  file: FileItem | null;
  onClose: () => void;
  onVersionUploaded: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  file,
  onClose,
  onVersionUploaded,
}) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [downloadingVersion, setDownloadingVersion] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success: toastSuccess, error: toastError, copied: toastCopied } = useToast();

  useEffect(() => {
    if (isOpen && file) {
      fetchVersions();
    }
  }, [isOpen, file]);

  const fetchVersions = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const data = await FileService.getFileVersions(file._id);
      setVersions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load version history:', err);
      toastError('Sync Failed', 'Could not load version timeline.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !file) return null;

  const handleDownloadVersion = async (versionNumber: number) => {
    setDownloadingVersion(versionNumber);
    try {
      await FileService.downloadFile(file._id, file.originalName);
      toastSuccess('Download Complete', `Version ${versionNumber} unlocked & downloaded.`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to download version.';
      toastError('Download Failed', msg);
    } finally {
      setDownloadingVersion(null);
    }
  };

  const handleUploadNewVersion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const newFile = e.target.files[0];

    setIsUploading(true);
    try {
      await FileService.uploadNewVersion(file._id, newFile);
      toastSuccess('New Version Uploaded', `Revision saved successfully.`);
      onVersionUploaded();
      fetchVersions();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to upload new version.';
      toastError('Upload Failed', msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toastCopied('Checksum Copied', 'SHA-256 hash copied to clipboard.');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-serif"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD] shadow-xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close version modal"
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1E1B4B] p-1.5 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 id="version-modal-title" className="text-xl font-bold text-[#1E1B4B]">
                Version History
              </h3>
              <p className="text-xs text-[#6B7280] truncate max-w-xs">{file.originalName}</p>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUploadNewVersion}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload Revision'}</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {isLoading ? (
            <div className="text-center py-10 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7C3AED]" />
              <p className="text-xs text-[#6B7280]">Loading version timeline...</p>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-xs text-center text-[#6B7280] py-8">
              No previous versions recorded for this file.
            </p>
          ) : (
            versions.map((ver) => {
              const isActive = ver.versionNumber === file.currentVersion;
              return (
                <div
                  key={ver.versionNumber}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#EDE9FE] border-[#C4B5FD]'
                      : 'bg-[#FAF8F5] border-[#E5E7EB] hover:bg-white'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#7C3AED]">
                        Version {ver.versionNumber}
                      </span>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] font-bold">
                          Current Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Size: {formatFileSize(ver.sizeBytes)} • Uploaded: {new Date(ver.createdAt).toLocaleString()}
                    </p>
                    {ver.sha256Hash && (
                      <div className="flex items-center space-x-1 text-xs text-[#9CA3AF]">
                        <span className="truncate max-w-[200px]">SHA256: {ver.sha256Hash}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(ver.sha256Hash)}
                          className="hover:text-[#1E1B4B]"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedHash === ver.sha256Hash ? (
                            <Check className="w-3.5 h-3.5 text-[#059669]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadVersion(ver.versionNumber)}
                    disabled={downloadingVersion === ver.versionNumber}
                    className="p-2.5 rounded-xl bg-white border border-[#D1D5DB] text-[#059669] hover:bg-[#D1FAE5] shadow-sm transition-colors cursor-pointer shrink-0"
                    title={`Download Version ${ver.versionNumber}`}
                  >
                    {downloadingVersion === ver.versionNumber ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#059669]" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-[#E5E7EB] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-[#FAF8F5] border border-[#D1D5DB] text-[#1E1B4B] hover:bg-[#E5E7EB] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
