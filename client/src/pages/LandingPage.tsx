import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CyberSphere3D } from '../components/CyberSphere3D';
import { siteConfig } from '../config/siteConfig';
import {
  Shield,
  Lock,
  Key,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  UserPlus,
  LogIn,
  Unlock,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Simple interactive demo for regular users
  const [sampleNote, setSampleNote] = useState('My Important Tax Documents & Passwords');
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B4B] flex flex-col font-serif selection:bg-[#D8B4FE] selection:text-[#1E1B4B]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION WITH 3D CYBER SPHERE */}
        <section
          id="overview"
          className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB]"
        >
          {/* Pastel Ambient Glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#F5C6EC]/40 via-[#C4B5FD]/30 to-[#FFF4C6]/50 rounded-full blur-[100px] pointer-events-none" />

          {/* 3D Cyber Sphere Animation (with pointer-events-none so all buttons are 100% clickable) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none">
            <CyberSphere3D className="w-full h-full max-w-[700px] max-h-[700px]" radius={180} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#FFF4C6] border border-[#FDE047] text-[#7C3AED] text-sm font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>Easy, Safe & Private File Storage</span>
            </div>

            {/* Headline in Times New Roman */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
                Keep Your Files Safe & <br />
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                  Private Everywhere
                </span>
              </h1>
              <p className="text-base sm:text-xl text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
                Store, protect, and share your important photos, PDFs, and documents. Every file is automatically locked with the highest security so only you can open them.
              </p>
            </div>

            {/* CTA Action Buttons (Fully Clickable!) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign Up (Create Free Account)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#F5C6EC]/20 border border-[#D1D5DB] hover:border-[#7C3AED] text-[#1E1B4B] font-bold text-base shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-[#7C3AED]" />
                <span>Sign In to Your Account</span>
              </Link>
            </div>

            {/* Simple Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-white border border-[#C4B5FD]/50 shadow-sm text-left">
                <span className="text-xs text-[#7C3AED] font-bold block">1. AUTOMATIC LOCK</span>
                <p className="text-base font-bold text-[#1E1B4B] mt-0.5">AES-256 Safe</p>
                <span className="text-xs text-[#6B7280]">Locked before upload</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#F5C6EC]/70 shadow-sm text-left">
                <span className="text-xs text-[#DB2777] font-bold block">2. EASY DOWNLOAD</span>
                <p className="text-base font-bold text-[#1E1B4B] mt-0.5">1-Click Unlock</p>
                <span className="text-xs text-[#6B7280]">Instant on any device</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#FFF4C6] shadow-sm text-left">
                <span className="text-xs text-[#B45309] font-bold block">3. SAFE SHARING</span>
                <p className="text-base font-bold text-[#1E1B4B] mt-0.5">Expiring Links</p>
                <span className="text-xs text-[#6B7280]">Optional passcode</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#C4B5FD]/50 shadow-sm text-left">
                <span className="text-xs text-[#7C3AED] font-bold block">4. ACCESSIBLE</span>
                <p className="text-base font-bold text-[#1E1B4B] mt-0.5">Any Computer</p>
                <span className="text-xs text-[#6B7280]">Works on phone & PC</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO BOX: HOW FILE LOCKING WORKS */}
        <section id="demo" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C4B5FD]/60 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7C3AED] font-bold block mb-1">
                  INTERACTIVE DEMONSTRATION
                </span>
                <h2 className="text-2xl font-bold text-[#1E1B4B]">
                  See How Your Files Stay Protected & Private
                </h2>
              </div>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  isLocked
                    ? 'bg-[#F5C6EC] text-[#831843] border border-[#F472B6]'
                    : 'bg-[#FFF4C6] text-[#78350F] border border-[#FDE047]'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Status: Locked (Safe)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Status: Unlocked</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plain text input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1E1B4B]">
                  1. Your Original File or Text:
                </label>
                <textarea
                  value={sampleNote}
                  onChange={(e) => setSampleNote(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5] resize-none"
                  placeholder="Type anything here..."
                />
                <p className="text-xs text-[#6B7280]">
                  This is what only you and authorized people see after unlocking.
                </p>
              </div>

              {/* Encrypted preview */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#7C3AED]">
                  2. What Hackers or Outsiders See:
                </label>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#C4B5FD] text-sm font-mono text-[#5B21B6] h-[104px] overflow-y-auto break-all">
                  {isLocked
                    ? Array.from(sampleNote || 'Safe')
                        .map((c) => (c.charCodeAt(0) ^ 0x3d).toString(16).padStart(2, '0'))
                        .join('')
                    : sampleNote}
                </div>
                <p className="text-xs text-[#6B7280]">
                  Without your password and key, the file is unreadable scrambled data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 SIMPLE KEY FEATURES */}
        <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5E7EB]">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs uppercase tracking-wider text-[#7C3AED] font-bold px-3 py-1 rounded-full bg-[#FFF4C6] border border-[#FDE047]">
              DESIGNED FOR EVERYONE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B]">
              Why You Can Trust ByteSphere
            </h2>
            <p className="text-base text-[#4B5563]">
              Simple to use, impossible to breach. Here is how we make file security effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteConfig.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#7C3AED]/60 hover:shadow-md transition-all duration-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">{feature.title}</h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WORKS ACROSS ALL DEVICES / LAPTOPS SECTION */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E5E7EB] bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-[#7C3AED] font-bold px-3 py-1 rounded-full bg-[#FFF4C6] border border-[#FDE047]">
                UNIVERSAL ACCESS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
                Share Links That Work On Any Device or Laptop
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed">
                When you share a file, you get a clean web link. Anyone you send it to can open it on their own laptop, phone, or browser without needing special software.
              </p>
              <ul className="space-y-2 text-sm text-[#374151]">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>Works on Chrome, Safari, Edge, Firefox, and mobile browsers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>Optional password challenge for extra privacy</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>Option to automatically delete link after 1 download</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#C4B5FD] shadow-sm space-y-3">
              <div className="flex items-center space-x-3 text-sm font-bold text-[#1E1B4B]">
                <Laptop className="w-5 h-5 text-[#7C3AED]" />
                <span>Shared Link Preview:</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D1D5DB] text-xs font-mono text-[#7C3AED] truncate">
                https://your-domain.com/share/b89f2a4c-secure
              </div>
              <p className="text-xs text-[#6B7280]">
                Recipients simply open the link, click "Download File", and get the unlocked original file instantly.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM SIGN UP CALL TO ACTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E5E7EB] bg-[#FAF8F5] text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#F5C6EC] p-0.5 mx-auto flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#7C3AED]" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-[#1E1B4B]">
              Start Protecting Your Important Files Today
            </h2>
            <p className="text-base text-[#4B5563]">
              Create an account in less than 30 seconds and upload your first secured file.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
              >
                <span>Sign Up (Free Account)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
