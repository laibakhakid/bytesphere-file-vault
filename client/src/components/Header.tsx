import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../config/siteConfig';
import {
  Shield,
  Lock,
  Menu,
  X,
  ArrowRight,
  FolderLock,
  LogOut,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#') && location.pathname !== '/') {
      window.location.href = href;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#C4B5FD] to-[#F5C6EC] p-0.5 shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#7C3AED]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1E1B4B]">
                {siteConfig.shortName}
              </span>
              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-[#FFF4C6] text-[#7C3AED] border border-[#FDE047]/60 font-semibold">
                <Lock className="w-3 h-3 mr-1 text-[#7C3AED]" />
                AES-256 Protected
              </span>
            </div>
            <p className="text-xs text-[#6B7280] hidden sm:block">
              Secure File Storage & Sharing
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {siteConfig.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#374151] hover:text-[#7C3AED] hover:bg-[#F5C6EC]/25 transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#7C3AED] hover:bg-[#C4B5FD]/25 transition-colors"
            >
              My Files
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <FolderLock className="w-4 h-4" />
                <span>Open My Files</span>
              </Link>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2.5 rounded-xl text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2] border border-[#E5E7EB] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#1E1B4B] hover:text-[#7C3AED] hover:bg-[#F5C6EC]/30 border border-[#D1D5DB] transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-sm shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl text-[#1E1B4B] hover:bg-[#F5C6EC]/40 border border-[#E5E7EB] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-[#FAF8F5] px-4 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {siteConfig.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1E1B4B] hover:bg-[#F5C6EC]/30"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#E5E7EB] flex flex-col space-y-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-bold text-sm text-center flex items-center justify-center space-x-2 shadow-md"
              >
                <FolderLock className="w-4 h-4" />
                <span>Go to My Files</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-center text-[#1E1B4B] bg-white border border-[#D1D5DB] flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-bold text-sm text-center shadow-md flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up (Create Account)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
