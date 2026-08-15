import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CyberSphere3D } from '../components/CyberSphere3D';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Key,
  ShieldCheck,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      success('Welcome Back!', 'You are now signed in to your secure file vault.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Cannot connect to backend server. Make sure the backend is running.' : err.message) ||
        'Sign in failed. Please check your email and password.';
      setError(msg);
      toastError('Sign In Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      title: 'Automatic Security Lock',
      desc: 'All documents are locked with AES-256 bank-level encryption.',
    },
    {
      title: 'Instant Download & Unlock',
      desc: 'Unlock your files in 1 click from any computer or phone.',
    },
    {
      title: 'Safe Sharing Links',
      desc: 'Send links with optional passwords and automatic expiration.',
    },
    {
      title: 'Activity Logs',
      desc: 'Keep track of all file uploads, downloads, and shares.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B4B] flex flex-col font-serif selection:bg-[#D8B4FE] selection:text-[#1E1B4B]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Background 3D Sphere (pointer-events-none so inputs are always responsive) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <CyberSphere3D className="w-full h-full max-w-[600px] max-h-[600px]" radius={160} />
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Easy English Intro */}
          <div className="lg:col-span-7 space-y-6 text-left hidden lg:block pr-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFF4C6] border border-[#FDE047] text-[#7C3AED] text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>PRIVATE & SAFE FILE ACCESS</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
                Sign In to Access Your <br />
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent">
                  Encrypted Documents
                </span>
              </h1>
              <p className="text-base text-[#4B5563] leading-relaxed max-w-lg">
                Enter your email and password to securely unlock and view your stored files.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {benefits.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-1"
                >
                  <div className="flex items-center space-x-2 text-[#7C3AED]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold text-[#1E1B4B]">{item.title}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Sign In Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD]/70 shadow-lg relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#F5C6EC] p-0.5 mx-auto mb-3 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#1E1B4B]">
                  Sign In to Your Account
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">Enter your details to view your files</p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-sm flex items-start space-x-2"
                >
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#1E1B4B] mb-1.5">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-[#1E1B4B]">
                      Your Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 rounded-lg text-[#6B7280] hover:text-[#1E1B4B] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
                <p className="text-sm text-[#6B7280]">
                  Don't have an account yet?{' '}
                  <Link
                    to="/register"
                    className="text-[#7C3AED] font-bold hover:underline"
                  >
                    Sign Up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
