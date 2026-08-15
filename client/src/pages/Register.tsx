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
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Password strength
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-[#EF4444]';
  let strengthTextColor = 'text-[#DC2626]';

  if (strengthScore === 4) {
    strengthLabel = 'Strong & Secure';
    strengthColor = 'bg-[#10B981]';
    strengthTextColor = 'text-[#059669]';
  } else if (strengthScore === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-[#7C3AED]';
    strengthTextColor = 'text-[#7C3AED]';
  } else if (strengthScore >= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-[#F59E0B]';
    strengthTextColor = 'text-[#D97706]';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await register(fullName.trim(), email.trim(), password);
      success('Account Created!', 'Your secure file storage account is ready.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Cannot connect to backend server. Make sure the backend is running.' : err.message) ||
        'Sign up failed. Please check your details.';
      setError(msg);
      toastError('Sign Up Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B4B] flex flex-col font-serif selection:bg-[#D8B4FE] selection:text-[#1E1B4B]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Background 3D Sphere (pointer-events-none so inputs are always responsive) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <CyberSphere3D className="w-full h-full max-w-[600px] max-h-[600px]" radius={160} />
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left hidden lg:block pr-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFF4C6] border border-[#FDE047] text-[#7C3AED] text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>FREE ENCRYPTED STORAGE</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
                Create Your Free <br />
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent">
                  Secure File Storage
                </span>
              </h1>
              <p className="text-base text-[#4B5563] leading-relaxed max-w-lg">
                Sign up in seconds to safely store, organize, and share your sensitive documents, images, and files with complete privacy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-[#1E1B4B]">
                What you get with your free account:
              </h3>
              <div className="space-y-2.5 text-sm text-[#4B5563]">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Bank-grade automatic file encryption (AES-256)</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Fast 1-click download from any device</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Share links with passwords and auto-expiration</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Smart document summaries & privacy scans</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C4B5FD]/70 shadow-lg relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#F5C6EC] p-0.5 mx-auto mb-3 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#1E1B4B]">
                  Create Account
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">Get started with your private vault</p>
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
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

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
                  <label className="block text-sm font-bold text-[#1E1B4B] mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#7C3AED] text-sm text-[#1E1B4B] bg-[#FAF8F5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 text-[#6B7280] hover:text-[#1E1B4B] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B7280]">Password Strength:</span>
                        <span className={`font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              strengthScore >= step ? strengthColor : 'bg-[#E5E7EB]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating account...' : 'Sign Up (Create Account)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
                <p className="text-sm text-[#6B7280]">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-[#7C3AED] font-bold hover:underline"
                  >
                    Sign In
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
