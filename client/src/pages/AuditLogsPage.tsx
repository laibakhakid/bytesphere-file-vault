import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Clock,
  Lock,
  X,
} from 'lucide-react';
import { AuditService } from '../services/auditService';
import { AuditLogItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { error: toastError } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await AuditService.getAuditLogs({
        action: actionFilter || undefined,
        status: statusFilter || undefined,
      });
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      toastError('Error', 'Could not refresh activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesStatus = statusFilter ? log.status === statusFilter : true;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const matchesSearch =
        (log.details && log.details.toLowerCase().includes(term)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(term)) ||
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [logs, searchTerm, statusFilter]);

  const totalEvents = logs.length;
  const successEvents = logs.filter((l) => l.status === 'SUCCESS').length;
  const alertEvents = logs.filter((l) => l.status === 'WARNING' || l.status === 'FAILURE').length;

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#059669]" />
          Success
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE047]">
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#D97706]" />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
        <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#DC2626]" />
        Failed
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-serif">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
              Activity & History Log
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047]">
              <Lock className="w-3 h-3 mr-1 text-[#7C3AED]" />
              Secure Log
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            See all security events, file uploads, downloads, and share activities in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAuditLogs}
          className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#7C3AED] text-[#1E1B4B] text-xs font-bold shadow-sm transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#7C3AED]' : ''}`} />
          <span>Refresh Activity</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#EDE9FE] text-[#7C3AED] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase">Total Events</p>
            <p className="text-2xl font-bold text-[#1E1B4B] mt-0.5">{totalEvents}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#D1FAE5] text-[#059669] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase">Successful Actions</p>
            <p className="text-2xl font-bold text-[#059669] mt-0.5">{successEvents}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase">Security Alerts</p>
            <p className="text-2xl font-bold text-[#DC2626] mt-0.5">{alertEvents}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, email, or details..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#1E1B4B]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILURE">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] text-[#374151] font-bold border-b border-[#E5E7EB]">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">User</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#6B7280]">
                    Loading activity records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#6B7280]">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4 font-bold text-[#7C3AED]">
                      {log.action}
                    </td>
                    <td className="p-4 text-xs text-[#374151]">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="p-4 text-xs text-[#4B5563] max-w-sm">
                      {log.details || '—'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-4 text-xs text-[#6B7280] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
