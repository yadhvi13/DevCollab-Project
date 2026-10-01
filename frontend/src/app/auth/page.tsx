"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Terminal } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import { Squiggle, SparkleStar } from '@/components/ui/DecorativeShapes';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
        setError(data.error || 'Something went wrong');
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative soft atmospheric glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#EA384C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group select-none">
        <div className="w-11 h-11 rounded-2xl bg-[#EA384C] flex items-center justify-center shadow-[0_8px_20px_rgba(234,56,76,0.35)] group-hover:scale-105 transition-transform">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-2xl text-[#111827] tracking-tight leading-none">
            Dev<span className="text-[#EA384C]">Collab</span>
          </span>
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono mt-1">
            Builder Network
          </span>
        </div>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glass-card p-6 sm:p-8 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl relative"
      >
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-3xl text-[#111827] tracking-tight">
            {isForgotPassword 
              ? 'Reset Password' 
              : isLogin 
                ? 'Welcome Back' 
                : 'Join DevCollab'}
          </h1>
          <p className="font-sans text-xs text-gray-500 mt-1 font-normal">
            {isForgotPassword
              ? 'Enter your email to receive recovery instructions'
              : isLogin
                ? 'Sign in to access your repositories and live lounge'
                : 'Create your developer profile and start collaborating'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#EA384C]">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#10B981]">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dev_coder"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs py-2.5 pl-10 pr-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] focus:bg-white focus:ring-2 focus:ring-[#EA384C]/15 transition-all text-[#111827]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs py-2.5 pl-10 pr-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] focus:bg-white focus:ring-2 focus:ring-[#EA384C]/15 transition-all text-[#111827]"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#EA384C] underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs py-2.5 pl-10 pr-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] focus:bg-white focus:ring-2 focus:ring-[#EA384C]/15 transition-all text-[#111827]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill-red w-full py-3 text-sm font-bold cursor-pointer mt-2 disabled:opacity-50 shadow-[0_10px_25px_rgba(234,56,76,0.35)]"
          >
            {isLoading 
              ? 'Please wait...' 
              : isForgotPassword 
                ? 'Send Reset Link' 
                : isLogin 
                  ? 'Sign In →' 
                  : 'Create Account →'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs font-medium text-gray-500">
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-[#111827] hover:underline font-bold cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-[#EA384C] hover:underline font-bold cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-[#EA384C] hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
