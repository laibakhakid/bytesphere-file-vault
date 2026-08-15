import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Shield, Lock, Cpu, FileText, AlertCircle } from 'lucide-react';
import { FileService } from '../services/fileService';
import { useToast } from '../context/ToastContext';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUploading]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setProgress(0);
    setStage('');
    setError('');
    setIsDragging(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setProgress(20);
    setStage('Locking file with AES-256 encryption...');

    try {
      const stepTimer1 = setTimeout(() => {
        setStage('Securing data stream...');
        setProgress(45);
      }, 400);

      const stepTimer2 = setTimeout(() => {
        setStage('Saving to your encrypted vault...');
        setProgress(75);
      }, 800);

      await FileService.uploadFile(selectedFile, (uploadPercent) => {
        setProgress(75 + Math.round(uploadPercent * 0.25));
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setStage('File safely stored!');
      setProgress(100);

      toastSuccess(
        'File Uploaded',
        `"${selectedFile.name}" is now safely encrypted in your vault.`
      );

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'File upload failed. Please try again.';
      setError(msg);
      toastError('Upload Failed', msg);
      setIsUploading(false);
    }
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
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-serif"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD] shadow-xl relative">
        <button
          onClick={handleModalClose}
          disabled={isUploading}
          aria-label="Close upload modal"
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1E1B4B] p-1.5 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-40 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 id="upload-modal-title" className="text-xl font-bold text-[#1E1B4B]">
              Upload & Protect File
            </h3>
            <p className="text-xs text-[#6B7280]">Files are automatically locked before saving</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-sm flex items-start space-x-2 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#7C3AED] bg-[#EDE9FE]'
                : 'border-[#C4B5FD] hover:border-[#7C3AED] bg-[#FAF8F5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="modal-file-upload-input"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mx-auto mb-3 text-[#7C3AED]">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <p className="text-base font-bold text-[#1E1B4B] mb-1">
              Click to select a file or drag and drop here
            </p>
            <p className="text-xs text-[#6B7280] mb-4">
              Documents, spreadsheets, images, PDFs, code, or archives up to 100MB
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047]">
              <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Bank-Grade AES-256 Encryption Active</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1E1B4B] truncate">{selectedFile.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'File'}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-[#7C3AED] font-bold hover:underline px-2 py-1 shrink-0 cursor-pointer"
                >
                  Choose Different File
                </button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB]">
                <div className="flex justify-between items-center text-xs text-[#1E1B4B]">
                  <span className="flex items-center text-[#7C3AED] font-bold truncate mr-2">
                    <Cpu className="w-3.5 h-3.5 mr-1.5 text-[#7C3AED] animate-spin shrink-0" />
                    {stage}
                  </span>
                  <span className="font-bold text-[#7C3AED] shrink-0">{progress}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#7C3AED] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isUploading ? 'Locking & Uploading...' : 'Upload & Lock File'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
