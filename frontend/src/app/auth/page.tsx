"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Sparkles, Terminal } from 'lucide-react';
import { API_BASE_URL } from '@/config';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');
    setIsLoading(true);

    if (isForgotPassword) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Something went wrong');
          setIsLoading(false);
          return;
        }

        setMessage(data.message || 'If this email is registered, a password reset link has been sent.');
        if (data.resetUrl) {
          setResetLink(data.resetUrl);
        }
        setIsLoading(false);
      } catch (err) {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials or user already exists');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      
      {/* ========================================================
          FLOATING BACK BUTTON (Stationary in upper-left)
          Matching UI Theme: 60px circle, white, ArrowLeft
      ======================================================== */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="fixed top-5 left-5 z-50 w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer text-black transition-transform duration-200 ease-out hover:scale-105 active:scale-95 border-0 focus:outline-none"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.4] text-black" />
      </button>

      {/* Atmospheric rich burgundy ambient backlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#B7194B]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-8 group select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#B7194B] flex items-center justify-center shadow-[0_10px_25px_rgba(183,25,75,0.4)] group-hover:scale-105 transition-transform">
          <span className="font-display font-black text-lg text-white">DC</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-display font-extrabold text-2xl text-white tracking-tight leading-none">
            DEV <span className="text-[#B7194B]">COLLAB</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mt-1">
            Real-time Workspace Engine
          </span>
        </div>
      </Link>

      {/* Auth Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        className="w-full max-w-md bg-[#121316] border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-[24px] p-6 sm:p-8 relative overflow-hidden text-left"
      >
        {/* Subtle top burgundy accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B7194B] to-transparent" />

        {/* Tab Toggle: Sign In vs Sign Up */}
        {!isForgotPassword && (
          <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-full mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-180 cursor-pointer ${
                isLogin
                  ? 'bg-[#B7194B] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-180 cursor-pointer ${
                !isLogin
                  ? 'bg-[#B7194B] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Card Title & Description */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
            {isForgotPassword
              ? 'Reset Password'
              : isLogin
                ? 'Welcome Back'
                : 'Join DevCollab'}
          </h1>
          <p className="font-sans text-xs text-zinc-400 mt-1 font-normal leading-relaxed">
            {isForgotPassword
              ? 'Enter your registered email to receive password recovery instructions.'
              : isLogin
                ? 'Enter your credentials to access your workspaces, repos, and live rooms.'
                : 'Create your developer profile and start pair-programming with peers.'}
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-medium text-rose-300 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Alert */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
              {resetLink && (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-400/90 font-mono">Reset Link Ready</span>
                  <a
                    href={resetLink}
                    className="px-3 py-1 bg-[#B7194B] hover:bg-[#c92055] text-white text-[11px] font-bold rounded-full transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Open Reset Page</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dev_architect"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/20 transition-all text-white placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/20 transition-all text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-[#ff7597] underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/20 transition-all text-white placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white font-bold text-xs uppercase tracking-wider transition-all duration-180 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_25px_rgba(183,25,75,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isForgotPassword ? (
              <span>Send Recovery Link</span>
            ) : isLogin ? (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Developer Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs font-medium text-zinc-500">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }}
              className="text-white hover:text-[#ff7597] underline font-bold cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : isLogin ? (
            <p>
              New to DevCollab?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
                className="text-[#ff7597] hover:underline font-bold cursor-pointer ml-1"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
                className="text-[#ff7597] hover:underline font-bold cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Trust Badges */}
      <div className="flex items-center gap-6 mt-8 text-xs font-medium text-zinc-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live Monaco Sync
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Socket.io Multi-peer
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Real Code
        </span>
      </div>

    </div>
  );
}
