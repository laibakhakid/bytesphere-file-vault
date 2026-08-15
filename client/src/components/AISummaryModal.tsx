import React from 'react';
import { X, Sparkles, Tag, CheckCircle2, FileText, Lock } from 'lucide-react';
import { FileItem } from '../types';

interface AISummaryModalProps {
  isOpen: boolean;
  file: FileItem | null;
  onClose: () => void;
  onUpdate?: (file: FileItem) => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  file,
  onClose,
}) => {
  if (!isOpen || !file) return null;

  const riskScore = file.aiRiskScore || 10;
  let riskColor = 'text-[#059669] bg-[#D1FAE5] border-[#A7F3D0]';
  let riskLabel = 'Safe (Low Sensitivity)';

  if (riskScore > 50) {
    riskColor = 'text-[#991B1B] bg-[#FEE2E2] border-[#FCA5A5]';
    riskLabel = 'High Sensitivity / Important';
  } else if (riskScore > 25) {
    riskColor = 'text-[#92400E] bg-[#FEF3C7] border-[#FDE047]';
    riskLabel = 'Moderate Sensitivity';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-serif"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD] shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close summary modal"
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1E1B4B] p-1.5 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 id="ai-modal-title" className="text-xl font-bold text-[#1E1B4B]">
              Document Summary & Privacy Scan
            </h3>
            <p className="text-xs text-[#6B7280] truncate max-w-xs">{file.originalName}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Classification & Risk Meter */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] uppercase font-bold block">Document Type</span>
              <p className="text-sm font-bold text-[#1E1B4B] mt-0.5">{file.aiClassification || 'General Document'}</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${riskColor}`}>
              <span className="text-xs font-bold uppercase block">Privacy & Risk</span>
              <p className="text-sm font-bold mt-0.5">{riskLabel}</p>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] space-y-1.5">
            <span className="text-xs font-bold text-[#6B7280] uppercase block">
              Automated Summary
            </span>
            <p className="text-sm text-[#374151] leading-relaxed">
              {file.aiSummary || 'No summary generated yet for this file.'}
            </p>
          </div>

          {/* Metadata Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#6B7280] uppercase block">
                Keywords & Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {file.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold border border-[#C4B5FD]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
