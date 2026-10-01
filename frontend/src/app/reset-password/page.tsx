"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Missing token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative bg-[#121316] border-zinc-800 rounded-[24px] overflow-hidden group shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-2">
      {/* Subtle top burgundy accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B7194B] to-transparent" />
      
      <CardHeader className="text-center pt-8 pb-4">
        <div className="flex justify-center mb-4 relative">
          <div className="w-12 h-12 rounded-2xl bg-[#B7194B] flex items-center justify-center shadow-[0_10px_25px_rgba(183,25,75,0.4)]">
            <Lock className="text-white w-6 h-6" />
          </div>
        </div>

        <CardTitle className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
          {success ? 'Success!' : 'New Password'}
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs font-normal mt-1 leading-relaxed">
          {success 
            ? 'Your password has been reset successfully.' 
            : 'Enter your new credentials below to restore workspace access.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
              key="error-alert"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <div className="space-y-4 text-center py-2">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            </div>
            <button 
              type="button"
              onClick={() => router.push('/auth')}
              className="w-full bg-[#B7194B] hover:bg-[#c92055] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-all shadow-[0_10px_25px_rgba(183,25,75,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-left">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/20 transition-all text-white placeholder:text-zinc-600"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-left">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/20 transition-all text-white placeholder:text-zinc-600"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#B7194B] hover:bg-[#c92055] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-all shadow-[0_10px_25px_rgba(183,25,75,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {!success && (
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => router.push('/auth')}
              className="text-zinc-400 hover:text-[#ff7597] font-semibold transition-colors text-xs cursor-pointer underline"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#090909] text-white p-4 font-sans select-none">
      
      {/* Floating Back Button */}
      <button
        type="button"
        onClick={() => router.push('/auth')}
        aria-label="Back"
        className="fixed top-5 left-5 z-50 w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer text-black transition-transform duration-200 ease-out hover:scale-105 active:scale-95 border-0 focus:outline-none"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.4] text-black" />
      </button>

      {/* Atmospheric rich burgundy ambient backlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#B7194B]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 group select-none">
        <div className="w-11 h-11 rounded-2xl bg-[#B7194B] flex items-center justify-center shadow-[0_10px_25px_rgba(183,25,75,0.4)] group-hover:scale-105 transition-transform">
          <span className="font-display font-black text-base text-white">DC</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-display font-extrabold text-xl text-white tracking-tight leading-none">
            DEV <span className="text-[#B7194B]">COLLAB</span>
          </span>
          <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase mt-1">
            Account Security
          </span>
        </div>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <Suspense fallback={
          <Card className="bg-[#121316] border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-8 h-8 border-3 border-[#B7194B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs text-zinc-400 font-mono">Loading reset session...</span>
          </Card>
        }>
          <ResetPasswordContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
