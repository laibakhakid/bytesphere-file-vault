import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Clock, KeyRound, Eye, EyeOff, AlertTriangle, Smartphone } from 'lucide-react';
import { ShareService } from '../services/shareService';
import { useToast } from '../context/ToastContext';
import { FileItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  file: FileItem | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, file, onClose }) => {
  const [ttlHours, setTtlHours] = useState<number>(24);
  const [isOneTime, setIsOneTime] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { success: toastSuccess, error: toastError, copied: toastCopied } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading]);

  if (!isOpen || !file) return null;

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleCreateShareLink = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await ShareService.createShareLink({
        fileId: file._id,
        ttlHours,
        isOneTime,
        password: password.trim() || undefined,
      });

      const fullUrl = `${window.location.origin}/share/${res.token}`;
      setShareUrl(fullUrl);
      toastSuccess('Share Link Created', `Link is active for ${ttlHours} hours.`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create share link. Please try again.';
      setError(msg);
      toastError('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toastCopied('Copied to Clipboard', 'Share link is ready to send to anyone.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setShareUrl('');
    setPassword('');
    setCopied(false);
    setError('');
    setIsOneTime(false);
    setTtlHours(24);
  };

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-serif"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD] shadow-xl relative">
        <button
          onClick={handleModalClose}
          aria-label="Close share modal"
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1E1B4B] p-1.5 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="share-modal-title" className="text-xl font-bold text-[#1E1B4B]">
              Share Protected File
            </h3>
            <p className="text-xs text-[#6B7280] truncate max-w-xs">{file.originalName}</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-sm flex items-start space-x-2"
          >
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!shareUrl ? (
          <div className="space-y-5">
            {/* Expiration Hours */}
            <div>
              <label className="block text-sm font-bold text-[#1E1B4B] mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-[#7C3AED]" />
                Link Expires In:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1 Hour', val: 1 },
                  { label: '24 Hours (1 Day)', val: 24 },
                  { label: '7 Days', val: 168 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTtlHours(item.val)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      ttlHours === item.val
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#4B5563] border-[#E5E7EB] hover:bg-[#EDE9FE]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* One-Time Download */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#1E1B4B] block">One-Time Download</span>
                <span className="text-xs text-[#6B7280]">Link self-destructs after the first download</span>
              </div>
              <input
                type="checkbox"
                checked={isOneTime}
                onChange={(e) => setIsOneTime(e.target.checked)}
                className="w-5 h-5 accent-[#7C3AED] rounded cursor-pointer"
              />
            </div>

            {/* Optional Passcode */}
            <div>
              <label className="block text-sm font-bold text-[#1E1B4B] mb-1.5 flex items-center">
                <KeyRound className="w-4 h-4 mr-1.5 text-[#7C3AED]" />
                Optional Passcode Protection
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for public link"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#6B7280] hover:text-[#1E1B4B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateShareLink}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{isLoading ? 'Creating Link...' : 'Generate Share Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-sm">
              <p className="font-bold">Your Share Link is Ready!</p>
              <p className="text-xs mt-0.5 text-[#047857]">
                Anyone with this link can unlock and download this file on any computer or phone.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 p-2.5 rounded-xl border border-[#D1D5DB] bg-[#FAF8F5] text-xs font-mono text-[#7C3AED]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Localhost Explanation Note for Phone Testing */}
            {isLocalhost && (
              <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE047] text-[#92400E] text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Smartphone className="w-4 h-4 text-[#D97706]" />
                  <span>Testing on your phone via Wi-Fi?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#78350F]">
                  Because this server is currently running on your laptop, opening <code>localhost</code> directly on a phone will not connect. Instead, use your laptop's Wi-Fi IP address (e.g. <code>http://192.168.x.x:5173/share/...</code>) or deploy to Vercel for public links that work everywhere!
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#7C3AED] font-bold hover:underline cursor-pointer"
              >
                Create Another Link
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#FAF8F5] border border-[#D1D5DB] text-[#1E1B4B] hover:bg-[#E5E7EB] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
