import React from 'react';
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

interface SecurityBadgeProps {
  type?: 'encryption' | 'risk' | 'status' | 'version' | 'active' | 'cipher';
  riskScore?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  type = 'encryption',
  riskScore = 0,
  label,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'risk') {
    let colorClass = 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
    let icon = <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#059669] shrink-0" />;
    let text = `Safe (${riskScore}% Risk)`;

    if (riskScore > 50) {
      colorClass = 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
      icon = <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#DC2626] shrink-0" />;
      text = `Sensitive (${riskScore}% Risk)`;
    } else if (riskScore > 25) {
      colorClass = 'bg-[#FEF3C7] text-[#92400E] border-[#FDE047]';
      icon = <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#D97706] shrink-0" />;
      text = `Moderate (${riskScore}% Risk)`;
    }

    return (
      <span
        className={`inline-flex items-center rounded-full font-bold border font-serif ${colorClass} ${sizeClasses}`}
      >
        {icon}
        {label || text}
      </span>
    );
  }

  if (type === 'cipher') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold border bg-[#FFF4C6] text-[#7C3AED] border-[#FDE047] font-serif ${sizeClasses}`}
      >
        <Lock className="w-3 h-3 mr-1 text-[#7C3AED] shrink-0" />
        {label || 'Locked (AES-256)'}
      </span>
    );
  }

  if (type === 'version') {
    return (
      <span
        className={`inline-flex items-center rounded-md font-bold font-serif bg-[#EDE9FE] text-[#7C3AED] border border-[#C4B5FD] ${sizeClasses}`}
      >
        {label}
      </span>
    );
  }

  if (type === 'active') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold border bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] font-serif ${sizeClasses}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5 animate-pulse" />
        {label || 'Active'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold bg-[#EDE9FE] text-[#7C3AED] border border-[#C4B5FD] font-serif ${sizeClasses}`}
    >
      <Lock className="w-3.5 h-3.5 mr-1.5 text-[#7C3AED] shrink-0" />
      {label || 'Protected (AES-256)'}
    </span>
  );
};
