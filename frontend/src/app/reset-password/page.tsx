"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <Card className="relative bg-zinc-950/60 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden group shadow-2xl p-2">
      {/* Subtle animated border glow */}
      <motion.div 
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/40 to-emerald-500/40 rounded-3xl -z-10 blur-xl transition-opacity duration-500" 
      />
      
      <CardHeader className="text-center pt-8 pb-6">
        <div className="flex justify-center mb-6 relative">
           <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative"
           >
              <div className="absolute inset-0 bg-indigo-500/40 blur-xl rounded-full" />
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl border border-white/20 shadow-xl relative z-10">
                 <Code2 className="text-white w-8 h-8" />
              </div>
              <Sparkles className="absolute -top-2 -right-4 w-5 h-5 text-emerald-400 animate-pulse" />
           </motion.div>
        </div>

        <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
          {success ? 'Success!' : 'New Password'}
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm font-medium mt-2">
          {success 
            ? 'Your password has been reset successfully.' 
            : 'Enter your new password below.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              key="error-alert"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            </div>
            <Button 
              onClick={() => router.push('/auth')}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <Input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-6 pl-12 pr-4 text-white placeholder-zinc-500 focus-visible:ring-indigo-500"
                placeholder="New password"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <Input 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-6 pl-12 pr-4 text-white placeholder-zinc-500 focus-visible:ring-indigo-500"
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center pt-2">
            <button 
              onClick={() => router.push('/auth')}
              className="text-indigo-400 hover:text-indigo-300 active:text-indigo-200 font-bold transition-colors text-sm cursor-pointer"
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
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10 p-4"
      >
        <Suspense fallback={
          <Card className="bg-zinc-950/60 backdrop-blur-2xl border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span className="text-sm text-zinc-400">Loading reset session...</span>
          </Card>
        }>
          <ResetPasswordContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
