import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Rocket, Mail, Lock, User as UserIcon, ArrowRight, Code2, Sparkles } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
    setIsLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Animated Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
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
            color: { value: ["#6366f1", "#10b981", "#8b5cf6"] },
            links: { color: "#6366f1", distance: 150, enable: true, opacity: 0.1, width: 1 },
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
          {/* Subtle animated border glow - Continuous breathing pulse so it looks alive on mobile */}
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
              {isLogin ? 'Welcome back' : 'Join DevCollab'}
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              {isLogin ? 'Sign in to access your workspaces' : 'Create an account to start collaborating'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                      placeholder="Username"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="Email address"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="Password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 active:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10">{isLoading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
              {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 active:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-zinc-500 text-sm font-medium">
              {isLogin ? "New to DevCollab?" : "Already have an account?"}
            </span>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-400 hover:text-indigo-300 active:text-indigo-200 font-bold transition-colors text-sm"
            >
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
