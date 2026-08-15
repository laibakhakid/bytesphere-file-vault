import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderLock, ShieldCheck, Activity, Settings, Lock, X, LogOut } from 'lucide-react';
import { QuotaBar } from './QuotaBar';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'My Encrypted Files',
      icon: FolderLock,
      badge: 'Protected',
    },
    {
      to: '/audit-logs',
      label: 'Activity & History Log',
      icon: Activity,
      badge: 'Live',
    },
    {
      to: '/settings',
      label: 'Security Settings',
      icon: Settings,
    },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full p-4 space-y-6 font-serif">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <p className="text-xs font-bold text-[#6B7280] uppercase mb-3 px-3">
            WORKSPACE
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#EDE9FE] text-[#7C3AED] border border-[#C4B5FD] shadow-sm'
                        : 'text-[#4B5563] hover:text-[#1E1B4B] hover:bg-[#FAF8F5] border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047] shrink-0 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security Assurance Card */}
        <div className="p-4 rounded-xl bg-white border border-[#C4B5FD]/70 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-[#7C3AED]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Full Privacy Guarantee</span>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            All files are automatically locked with your private keys before being stored. No one else can read your files.
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-[#059669] pt-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Encryption Active</span>
          </div>
        </div>
      </div>

      {/* Storage Quota */}
      <div className="space-y-4 pt-2">
        {user && (
          <QuotaBar usedBytes={user.storageUsedBytes || 0} quotaBytes={user.storageQuotaBytes || 0} />
        )}

        {/* Mobile-only Logout button */}
        <div className="md:hidden pt-2 border-t border-[#E5E7EB]">
          <button
            onClick={() => {
              onCloseMobile?.();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#DC2626] text-sm font-bold hover:bg-[#FECACA] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 border-r border-[#E5E7EB] bg-[#FAF8F5] hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FAF8F5] border-r border-[#E5E7EB] shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-250 font-serif">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#1E1B4B] font-bold text-sm">
                <Lock className="w-4 h-4 text-[#7C3AED]" />
                <span>Vault Menu</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
