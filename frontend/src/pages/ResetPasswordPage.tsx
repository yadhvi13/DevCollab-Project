import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

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
        <div className="relative bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden group">
          {/* Subtle animated border glow */}
          <motion.div 
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/40 to-emerald-500/40 rounded-3xl -z-10 blur-xl sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" 
          />
          
          <div className="flex justify-center mb-8 relative">
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

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-2 tracking-tight">
              {success ? 'Success!' : 'New Password'}
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              {success 
                ? 'Your password has been reset successfully.' 
                : 'Enter your new password below.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
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
              <button 
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                  placeholder="New password"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 active:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10 font-bold">
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </span>
                {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 active:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate('/auth')}
                className="text-indigo-400 hover:text-indigo-300 active:text-indigo-200 font-bold transition-colors text-sm cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
          
        </div>
      </motion.div>
    </div>
  );
}
