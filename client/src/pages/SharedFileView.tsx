import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CyberSphere3D } from '../components/CyberSphere3D';
import {
  Shield,
  Download,
  Lock,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { ShareService } from '../services/shareService';
import { useToast } from '../context/ToastContext';

export const SharedFileView: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [info, setInfo] = useState<any>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (token) {
      fetchShareInfo();
    }
  }, [token]);

  const fetchShareInfo = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ShareService.getShareInfo(token!);
      setInfo(data);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'This share link is invalid, expired, or has already been downloaded.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsDownloading(true);
    setError('');

    try {
      await ShareService.downloadSharedFile(token, password);
      setDownloadComplete(true);
      toastSuccess('Download Complete', 'Your file has been unlocked and downloaded to your computer.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Download failed. Please check the passcode and try again.';
      setError(msg);
      toastError('Download Failed', msg);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B4B] flex flex-col font-serif selection:bg-[#D8B4FE] selection:text-[#1E1B4B]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Background 3D Sphere */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <CyberSphere3D className="w-full h-full max-w-[600px] max-h-[600px]" radius={160} />
        </div>

        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD]/70 shadow-lg relative z-10">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#F5C6EC] p-0.5 mx-auto mb-3 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#7C3AED]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#1E1B4B]">
              Shared Secure File
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Anyone with this link can download this file</p>
          </div>

          {error ? (
            <div className="p-5 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-sm text-center space-y-3">
              <AlertTriangle className="w-8 h-8 mx-auto text-[#EF4444]" />
              <div>
                <p className="font-bold text-base text-[#7F1D1D]">Link Expired or Unavailable</p>
                <p className="mt-1 text-[#991B1B] leading-relaxed">{error}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm text-[#7C3AED] font-bold hover:underline"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-10 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7C3AED]" />
              <p className="text-sm text-[#6B7280]">
                Loading shared file details...
              </p>
            </div>
          ) : info ? (
            <div className="space-y-5">
              {/* File Info Card */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E7EB] space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[#1E1B4B] truncate" title={info.fileName}>
                      {info.fileName}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Size: {formatFileSize(info.sizeBytes)} • {info.classification || 'Encrypted Document'}
                    </p>
                  </div>
                </div>
              </div>

              {/* One-Time Warning Banner */}
              {info.isOneTime && (
                <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE047] text-[#92400E] text-xs flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">One-Time Download Link</span>
                    <p className="mt-0.5">
                      This link will self-destruct and become inactive after you download the file once.
                    </p>
                  </div>
                </div>
              )}

              {downloadComplete ? (
                <div className="p-5 rounded-2xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-sm text-center space-y-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto" />
                  <div>
                    <p className="font-bold text-base text-[#065F46]">File Unlocked & Downloaded!</p>
                    <p className="text-[#047857] mt-1 text-xs">
                      The file was securely unlocked and saved to your device downloads.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDownload} className="space-y-4">
                  {info.hasPassword && (
                    <div>
                      <label className="block text-sm font-bold text-[#1E1B4B] mb-1.5 flex items-center">
                        <KeyRound className="w-4 h-4 mr-1.5 text-[#7C3AED]" />
                        Enter Passcode to Unlock
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter access passcode"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 p-1 text-[#6B7280] hover:text-[#1E1B4B] transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isDownloading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Unlocking & Downloading...' : 'Download File'}</span>
                  </button>
                </form>
              )}

              {/* Footer Note */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span className="flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1 text-[#7C3AED]" />
                  Bank-Grade Encryption
                </span>
                <span className="flex items-center text-[#059669]">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#059669]" />
                  Virus & Tamper Checked
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};
