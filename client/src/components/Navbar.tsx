import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  LogOut,
  User as UserIcon,
  Lock,
  Menu,
  X,
  Settings,
  Activity,
  FolderLock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    info('Signed Out', 'You have been signed out successfully.');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-[#FAF8F5]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-serif">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          className="md:hidden p-2 rounded-xl text-[#1E1B4B] hover:bg-[#F5C6EC]/30 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Name */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#C4B5FD] to-[#F5C6EC] p-0.5 shadow-sm group-hover:shadow-md transition-all">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#7C3AED]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base text-[#1E1B4B]">
                ByteSphere File Vault
              </span>
              <span className="hidden sm:inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047] font-semibold">
                <Lock className="w-2.5 h-2.5 mr-1 text-[#7C3AED]" />
                Protected
              </span>
            </div>
            <p className="text-xs text-[#6B7280] hidden sm:block">
              Your Safe File Dashboard
            </p>
          </div>
        </Link>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#7C3AED] hover:bg-white border border-[#E5E7EB] transition-colors"
        >
          Home Overview
        </Link>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-all text-left cursor-pointer"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[#1E1B4B] leading-tight truncate max-w-[130px]">
                  {user.fullName}
                </p>
                <span className="text-xs text-[#6B7280] block">
                  {user.role}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl p-2 border border-[#E5E7EB] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] mb-1.5">
                  <p className="text-sm font-bold text-[#1E1B4B] truncate">{user.fullName}</p>
                  <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                </div>

                <div className="space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#374151] hover:text-[#7C3AED] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <FolderLock className="w-4 h-4 text-[#7C3AED]" />
                    <span>My Files</span>
                  </Link>

                  <Link
                    to="/audit-logs"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#374151] hover:text-[#7C3AED] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Activity className="w-4 h-4 text-[#7C3AED]" />
                    <span>Activity Log</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#374151] hover:text-[#7C3AED] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#7C3AED]" />
                    <span>Security Details</span>
                  </Link>
                </div>

                <div className="pt-1.5 mt-1.5 border-t border-[#E5E7EB]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
