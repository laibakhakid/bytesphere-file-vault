import React from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Cpu,
  Server,
  FileCode,
  CheckCircle2,
  Activity,
  HardDrive,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const specs = [
    {
      title: 'AES-256 File Lock',
      spec: 'Bank-Grade Encryption',
      description:
        'Every document is automatically locked before it is stored. Outsidiers and hackers cannot read your files.',
      icon: Lock,
      badge: 'Protected',
    },
    {
      title: 'Isolated Private Keys',
      spec: 'Per-File Security',
      description:
        'Each file receives its own digital key, ensuring that one file cannot compromise another.',
      icon: Key,
      badge: 'Private',
    },
    {
      title: 'Fast & Secure Streaming',
      spec: 'Zero Memory Leakage',
      description:
        'Files are streamed directly and efficiently without leaving unprotected copies in computer memory.',
      icon: Cpu,
      badge: 'Efficient',
    },
    {
      title: 'Universal Device Access',
      spec: 'Phone, Tablet, Laptop',
      description:
        'Access your safe files and download them easily from any modern browser or device.',
      icon: Server,
      badge: 'Universal',
    },
    {
      title: 'File Integrity Checks',
      spec: 'Tamper-Proof Verification',
      description:
        'Every version verifies that not a single byte was altered or corrupted during transfer.',
      icon: FileCode,
      badge: 'Verified',
    },
    {
      title: 'Secure Account Sessions',
      spec: 'Protected Logins',
      description:
        'Sessions are encrypted and automatically protected against unauthorized access.',
      icon: Activity,
      badge: 'Safe Session',
    },
  ];

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-200 font-serif">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Security Settings & Details
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047]">
            Active
          </span>
        </div>
        <p className="text-sm text-[#6B7280] mt-1">
          Learn how your files and personal documents are kept safe and private.
        </p>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C4B5FD] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED] border border-[#C4B5FD]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047] font-bold">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1E1B4B]">{item.title}</h3>
                  <p className="text-xs text-[#7C3AED] mt-0.5 font-bold">{item.spec}</p>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center text-xs text-[#059669] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>Active & Protected</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active User Account Info */}
      {user && (
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#D1FAE5] text-[#059669]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1B4B]">
                Your Account Status
              </h3>
              <p className="text-xs text-[#6B7280]">
                Logged in securely
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] block uppercase font-bold">Account Name</span>
              <span className="text-sm text-[#1E1B4B] font-bold block mt-0.5 truncate">{user.fullName}</span>
              <span className="text-xs text-[#6B7280] truncate block">{user.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] block uppercase font-bold">Account Tier</span>
              <span className="text-sm text-[#7C3AED] font-bold block mt-0.5 uppercase">{user.role} Member</span>
              <span className="text-xs text-[#059669] flex items-center mt-0.5 font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Encryption Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] block uppercase font-bold">Storage Allowance</span>
              <span className="text-sm text-[#059669] font-bold block mt-0.5">
                {formatSize(user.storageQuotaBytes || 10 * 1024 * 1024 * 1024)} Total
              </span>
              <span className="text-xs text-[#6B7280] block mt-0.5">
                {formatSize(user.storageUsedBytes || 0)} used
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
