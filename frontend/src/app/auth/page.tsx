"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Code2, Sparkles } from 'lucide-react';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { API_BASE_URL } from '@/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const particlesInit = useCallback(async (engine: Engine) => {
    try {
      await loadSlim(engine);
    } catch (error) {
      console.warn("Particles engine failed to load slim:", error);
    }
  }, []);

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
      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-y-auto bg-transparent py-8 sm:py-12">
      {/* Animated Particles Background */}
      <ParticlesProvider init={particlesInit}>
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" },
                onClick: { enable: true, mode: "push" },
              },
              modes: {
                grab: { distance: 150, links: { opacity: 0.3 } },
                push: { quantity: 4 },
              },
            },
            particles: {
              color: { value: ["#e79e6b", "#d97706", "#f59e0b"] },
              links: { color: "#e79e6b", distance: 150, enable: true, opacity: 0.1, width: 1 },
              move: { enable: true, speed: 0.8, direction: "none", outModes: { default: "bounce" } },
              number: { density: { enable: true, width: 800 }, value: 80 },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0 pointer-events-auto"
        />
      </ParticlesProvider>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10 p-4"
      >
        <Card className="relative bg-[#120f0e]/60 backdrop-blur-2xl border-[#2d2623] rounded-3xl overflow-hidden group shadow-2xl p-2">
          {/* Subtle animated border glow */}
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/30 to-indigo-900/30 rounded-3xl -z-10 blur-xl transition-opacity duration-500" 
          />
          
          <CardHeader className="text-center pt-8 pb-6">
            <div className="flex justify-center mb-6 relative">
               <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative"
               >
                  <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full" />
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl border border-[#2d2623] shadow-xl relative z-10">
                     <Code2 className="text-zinc-950 w-8 h-8" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-4 w-5 h-5 text-indigo-500 animate-pulse" />
               </motion.div>
            </div>

            <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
              {isForgotPassword 
                ? 'Reset password' 
                : (isLogin ? 'Welcome back' : 'Join DevCollab')}
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm font-medium mt-2">
              {isForgotPassword 
                ? 'Enter your email to receive a password reset link' 
                : (isLogin ? 'Sign in to access your workspaces' : 'Create an account to start collaborating')}
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
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  key="message-alert"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && !isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    key="username-input"
                  >
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors z-10" />
                      <Input 
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl py-6 pl-12 pr-4 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/50"
                        placeholder="Username"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors z-10" />
                <Input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl py-6 pl-12 pr-4 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/50"
                  placeholder="Email address"
                  required
                />
              </div>

              {!isForgotPassword && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors z-10" />
                  <Input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl py-6 pl-12 pr-4 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/50"
                    placeholder="Password"
                    required
                  />
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setMessage('');
                    }}
                    className="text-zinc-400 hover:text-indigo-500 focus:text-indigo-500 transition-colors text-xs font-semibold cursor-pointer focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold py-6 rounded-full transition-all shadow-[0_0_20px_rgba(231,158,107,0.3)] hover:shadow-[0_0_25px_rgba(231,158,107,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>
                  {isLoading 
                    ? (isForgotPassword ? 'Sending Link...' : 'Authenticating...') 
                    : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account'))}
                </span>
                {!isLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>

            <div className="text-center pt-2">
              {isForgotPassword ? (
                <button 
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setMessage('');
                  }}
                  className="text-indigo-500 hover:text-indigo-500/80 active:text-indigo-500/70 font-bold transition-colors text-sm cursor-pointer bg-transparent border-none"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  <span className="text-zinc-500 text-sm font-medium">
                    {isLogin ? "New to DevCollab?" : "Already have an account?"}
                  </span>
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setMessage('');
                    }}
                    className="ml-2 text-indigo-500 hover:text-indigo-500/80 active:text-indigo-500/70 font-bold transition-colors text-sm cursor-pointer bg-transparent border-none"
                  >
                    {isLogin ? 'Create an account' : 'Sign in instead'}
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
