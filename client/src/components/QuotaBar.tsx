import React from 'react';
import { HardDrive } from 'lucide-react';

interface QuotaBarProps {
  usedBytes: number;
  quotaBytes: number;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({ usedBytes, quotaBytes }) => {
  const safeQuota = quotaBytes > 0 ? quotaBytes : 10 * 1024 * 1024 * 1024;
  const percentage = Math.min(100, Math.round((usedBytes / safeQuota) * 100));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  let barColor = 'from-[#7C3AED] to-[#A78BFA]';
  let badgeColor = 'text-[#7C3AED] bg-[#EDE9FE] border-[#C4B5FD]';

  if (percentage > 85) {
    barColor = 'from-[#EF4444] to-[#F59E0B]';
    badgeColor = 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]';
  } else if (percentage > 70) {
    barColor = 'from-[#F59E0B] to-[#7C3AED]';
    badgeColor = 'text-[#D97706] bg-[#FEF3C7] border-[#FDE047]';
  }

  return (
    <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2.5 shadow-sm font-serif">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-bold text-[#1E1B4B]">
          <HardDrive className="w-4 h-4 text-[#7C3AED]" />
          <span>Storage Space</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#E5E7EB] p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${barColor}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-[#6B7280]">
        <span>{formatSize(usedBytes)} used</span>
        <span>{formatSize(safeQuota)} total</span>
      </div>
    </div>
  );
};
