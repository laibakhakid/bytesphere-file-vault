import React, { useState, useEffect, useMemo } from 'react';
import {
  UploadCloud,
  Search,
  Grid,
  List,
  Shield,
  FileText,
  Download,
  Share2,
  History,
  Sparkles,
  Trash2,
  HardDrive,
  CheckCircle2,
  Tag,
  Lock,
  RefreshCw,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { FileService } from '../services/fileService';
import { FileItem, QuotaStats } from '../types';
import { SecurityBadge } from '../components/SecurityBadge';
import { FileUploadModal } from '../components/FileUploadModal';
import { ShareModal } from '../components/ShareModal';
import { VersionHistoryModal } from '../components/VersionHistoryModal';
import { AISummaryModal } from '../components/AISummaryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type SortOption = 'newest' | 'oldest' | 'name' | 'size' | 'risk';

export const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [quotaStats, setQuotaStats] = useState<QuotaStats | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [versionFile, setVersionFile] = useState<FileItem | null>(null);
  const [aiFile, setAiFile] = useState<FileItem | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [search, selectedTag]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [filesRes, statsRes] = await Promise.all([
        FileService.listFiles(search, selectedTag),
        FileService.getQuotaStats(),
      ]);
      setFiles(filesRes.files || []);
      setQuotaStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      toastError('Sync Failed', 'Could not refresh file list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    setDownloadingId(file._id);
    try {
      await FileService.downloadFile(file._id, file.originalName);
      toastSuccess('Download Complete', `"${file.originalName}" has been unlocked & saved.`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Download failed.';
      toastError('Download Failed', msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!deleteFileTarget) return;
    setIsDeleting(true);
    try {
      await FileService.deleteFile(deleteFileTarget._id);
      toastSuccess('File Deleted', `"${deleteFileTarget.originalName}" was permanently removed.`);
      setDeleteFileTarget(null);
      refreshProfile();
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete file.';
      toastError('Delete Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (file: FileItem) => {
    const ext = file.originalName.split('.').pop()?.toLowerCase() || '';
    const mime = file.mimeType || '';

    if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-[#D97706]" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'go', 'json', 'env', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-[#7C3AED]" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-[#059669]" />;
    }
    return <FileText className="w-5 h-5 text-[#7C3AED]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const allTags = useMemo(() => {
    return Array.from(new Set(files.flatMap((f) => f.tags || []))).filter(Boolean);
  }, [files]);

  const sortedFiles = useMemo(() => {
    const list = [...files];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':
        return list.sort((a, b) => a.originalName.localeCompare(b.originalName));
      case 'size':
        return list.sort((a, b) => b.sizeBytes - a.sizeBytes);
      case 'risk':
        return list.sort((a, b) => (b.aiRiskScore || 0) - (a.aiRiskScore || 0));
      default:
        return list;
    }
  }, [files, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-serif">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
              My Encrypted Files
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047]">
              <Lock className="w-3 h-3 mr-1 text-[#7C3AED]" />
              Safe & Private
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            {user ? `Hello ${user.fullName} • ` : ''}
            All files are automatically locked with private AES-256 encryption.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#EDE9FE] text-[#7C3AED] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#6B7280] uppercase">
              Total Files
            </p>
            <p className="text-2xl font-bold text-[#1E1B4B] mt-0.5">
              {isLoading && !quotaStats ? '...' : quotaStats?.fileCount || files.length}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#EDE9FE] text-[#7C3AED] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#6B7280] uppercase">
              Storage Used
            </p>
            <p className="text-2xl font-bold text-[#1E1B4B] mt-0.5">
              {isLoading && !quotaStats ? '...' : `${quotaStats?.usedPercentage || '0'}%`}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#D1FAE5] text-[#059669] shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#6B7280] uppercase">
              Downloads
            </p>
            <p className="text-2xl font-bold text-[#1E1B4B] mt-0.5">
              {isLoading && !quotaStats
                ? '...'
                : files.reduce((acc, f) => acc + (f.downloadCount || 0), 0)}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#FEF3C7] text-[#D97706] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#6B7280] uppercase">
              Security Status
            </p>
            <p className="text-2xl font-bold text-[#059669] mt-0.5">
              {isLoading && !quotaStats ? '...' : `${quotaStats?.securityScore || 98}% Safe`}
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Quick Area */}
      <div
        onClick={() => setIsUploadOpen(true)}
        className="p-5 rounded-2xl border-2 border-dashed border-[#C4B5FD] hover:border-[#7C3AED] bg-white hover:bg-[#FAF8F5] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="p-2.5 rounded-xl bg-[#EDE9FE] text-[#7C3AED] shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E1B4B]">
              Click or drag & drop files here to safely lock and upload
            </p>
            <p className="text-xs text-[#6B7280]">
              Supports documents, photos, code, spreadsheets, and archives
            </p>
          </div>
        </div>

        <span className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7C3AED] text-white transition-colors shrink-0">
          Browse Computer
        </span>
      </div>

      {/* Search, Filter, Sort and View Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name or keywords..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#1E1B4B]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap sm:flex-nowrap">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-xs text-[#374151] shrink-0 font-serif">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort files by"
                className="bg-transparent text-xs text-[#1E1B4B] focus:outline-none cursor-pointer font-serif"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">File Name (A-Z)</option>
                <option value="size">File Size</option>
                <option value="risk">Safety Rating</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 border border-[#E5E7EB] bg-[#FAF8F5] p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1E1B4B]'
                }`}
                aria-label="Grid View"
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1E1B4B]'
                }`}
                aria-label="Table View"
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              title="Refresh Files"
              className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] text-[#6B7280] hover:text-[#7C3AED] transition-colors shrink-0 cursor-pointer"
              aria-label="Refresh Files"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#7C3AED]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
            <span className="text-xs font-bold text-[#6B7280] flex items-center shrink-0">
              <Tag className="w-3.5 h-3.5 mr-1 text-[#7C3AED]" />
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                selectedTag === ''
                  ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]'
                  : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#1E1B4B]'
              }`}
            >
              All Files ({files.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#1E1B4B]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Explorer Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
                <div className="w-20 h-5 rounded-full skeleton-shimmer" />
              </div>
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#1E1B4B]">
              {search || selectedTag ? 'No Matching Files Found' : 'No Files in Your Vault Yet'}
            </h3>
            <p className="text-sm text-[#6B7280]">
              {search || selectedTag
                ? 'Try searching with another keyword or remove the active tag filter.'
                : 'Upload your first file to lock and protect it with bank-grade security.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (search || selectedTag) {
                setSearch('');
                setSelectedTag('');
              } else {
                setIsUploadOpen(true);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold shadow-md cursor-pointer"
          >
            {search || selectedTag ? 'Clear Filters' : 'Upload First File'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFiles.map((file) => (
            <div
              key={file._id}
              className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#C4B5FD] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <SecurityBadge type="risk" riskScore={file.aiRiskScore || 10} />
                </div>

                <div>
                  <h4
                    className="text-base font-bold text-[#1E1B4B] truncate"
                    title={file.originalName}
                  >
                    {file.originalName}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-[#6B7280] mt-1">
                    <span>{formatFileSize(file.sizeBytes)}</span>
                    <span>•</span>
                    <span className="text-[#7C3AED] font-bold">v{file.currentVersion}</span>
                    <span>•</span>
                    <span className="truncate">{file.aiClassification || 'Document'}</span>
                  </div>
                </div>

                {file.aiSummary && (
                  <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5E7EB] italic">
                    "{file.aiSummary}"
                  </p>
                )}

                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {file.tags.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTag(t)}
                        className="text-xs px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#EDE9FE] text-[#7C3AED] border border-[#E5E7EB] transition-colors cursor-pointer"
                      >
                        #{t}
                      </button>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs px-1.5 py-0.5 rounded text-[#9CA3AF]">
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file._id}
                    title="Download & Unlock File"
                    aria-label={`Download ${file.originalName}`}
                    className="p-2 rounded-lg text-[#059669] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                  >
                    {downloadingId === file._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#059669]" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareFile(file)}
                    title="Create Safe Share Link"
                    aria-label={`Share ${file.originalName}`}
                    className="p-2 rounded-lg text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setVersionFile(file)}
                    title="Version History"
                    aria-label={`Versions for ${file.originalName}`}
                    className="p-2 rounded-lg text-[#6B7280] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiFile(file)}
                    title="Summary & AI Details"
                    aria-label={`AI report for ${file.originalName}`}
                    className="p-2 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteFileTarget(file)}
                  title="Delete File"
                  aria-label={`Delete ${file.originalName}`}
                  className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-[#374151] font-bold border-b border-[#E5E7EB]">
                <tr>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Safety Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sortedFiles.map((file) => (
                  <tr key={file._id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4 font-bold text-[#1E1B4B]">
                      <div className="flex items-center space-x-2.5 max-w-xs truncate">
                        <div className="shrink-0">{getFileIcon(file)}</div>
                        <span className="truncate" title={file.originalName}>{file.originalName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#6B7280] whitespace-nowrap text-xs">
                      {file.aiClassification || 'Document'}
                    </td>
                    <td className="p-4 text-[#6B7280] whitespace-nowrap text-xs">
                      {formatFileSize(file.sizeBytes)}
                    </td>
                    <td className="p-4 text-[#7C3AED] font-bold whitespace-nowrap text-xs">
                      v{file.currentVersion}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <SecurityBadge type="risk" riskScore={file.aiRiskScore || 10} size="sm" />
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === file._id}
                          className="p-1.5 text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareFile(file)}
                          className="p-1.5 text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVersionFile(file)}
                          className="p-1.5 text-[#6B7280] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                          title="Version History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiFile(file)}
                          className="p-1.5 text-[#D97706] hover:bg-[#FEF3C7] rounded-lg transition-colors cursor-pointer"
                          title="Summary Report"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteFileTarget(file)}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          refreshProfile();
          fetchData();
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={!!shareFile}
        file={shareFile}
        onClose={() => setShareFile(null)}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={!!versionFile}
        file={versionFile}
        onClose={() => setVersionFile(null)}
        onVersionUploaded={() => {
          refreshProfile();
          fetchData();
        }}
      />

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={!!aiFile}
        file={aiFile}
        onClose={() => setAiFile(null)}
        onUpdate={(updated) => {
          setAiFile(updated);
          fetchData();
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deleteFileTarget}
        title="Delete File Permanently?"
        message={`Are you sure you want to delete "${deleteFileTarget?.originalName}"? This file will be permanently removed.`}
        confirmText="Delete File"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteFile}
        onClose={() => setDeleteFileTarget(null)}
      />
    </div>
  );
};
