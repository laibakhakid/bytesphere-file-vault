import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Cpu, FileCheck, CheckCircle2, ChevronDown, ChevronUp, Activity, Server } from 'lucide-react';

export const SecurityStatusCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const securityPillars = [
    {
      title: 'AES-256-GCM Streaming Cipher',
      spec: '12-Byte IV • 16-Byte Auth Tag',
      description: 'Authenticated stream cipher providing payload confidentiality and integrity against bit-flipping.',
      icon: Lock,
      status: 'Active',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
    },
    {
      title: 'Envelope Key Architecture (DEK/KEK)',
      spec: '256-Bit Unique Per-File Keys',
      description: 'Each file payload is encrypted with an isolated DEK. The DEK itself is encrypted using the Master KEK.',
      icon: Key,
      status: 'Protected',
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
    },
    {
      title: 'Zero-RAM Buffering Pipeline',
      spec: 'Stream Engine • Backpressure Safe',
      description: 'Incoming multi-part file bytes stream directly through cryptographic transform streams to storage.',
      icon: Cpu,
      status: 'Optimized',
      color: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    {
      title: 'Immutable Compliance Audit Ledger',
      spec: 'IP Log • Event Trace • Non-Repudiation',
      description: 'Every cryptographic operation, share generation, and decryption touchpoint is recorded.',
      icon: Activity,
      status: 'Audited',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background ambient security glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-indigo-500/20 p-0.5 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Cryptographic Security Engine
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                PROTECTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-Knowledge AES-256-GCM Envelope Architecture Active
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20 self-start sm:self-center"
        >
          <span>{isExpanded ? 'Hide Architecture Specs' : 'View Security Proofs'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-in fade-in duration-200">
          {securityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 flex items-start space-x-3"
              >
                <div className={`p-2 rounded-lg bg-slate-800/80 ${pillar.color} border border-slate-700/60 shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{pillar.title}</h4>
                    <span className="text-[10px] font-mono font-medium text-emerald-400 flex items-center ml-2 shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {pillar.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{pillar.spec}</p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
