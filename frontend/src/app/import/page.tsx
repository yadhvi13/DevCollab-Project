"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DownloadCloud, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ImportRepo() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cloneUrl, setCloneUrl] = useState('');
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneUrl.trim() || !name.trim()) {
      setError('Clone URL and Repository name are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/repos/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cloneUrl, name, isPrivate })
      });

      if (res.ok) {
        const newRepo = await res.json();
        router.push(`/repo/${newRepo._id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to import repository');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-b border-[#2d2623] pb-6 mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Import a repository</h1>
          <p className="text-[#8b949e] mt-2 text-sm">
            Enter the clone URL of the repository you want to import to your DevCollab account.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Your old repository's clone URL <span className="text-red-400">*</span></label>
            <Input
              type="text"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              placeholder="https://github.com/user/repo.git"
              className="w-full max-w-xl bg-[#0b0908]/60 border border-[#2d2623] rounded-xl text-white focus-visible:ring-indigo-500/50 h-[40px]"
              autoFocus
            />
          </div>

          <div className="flex items-end gap-2 pt-4 border-t border-[#2d2623]">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Owner</label>
              <div className="bg-[#120f0e] border border-[#2d2623] rounded-xl px-3 py-2 flex items-center gap-2 cursor-not-allowed opacity-80 h-[40px]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-zinc-950 text-[10px] font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white text-sm">{user?.username}</span>
              </div>
            </div>
            <span className="text-2xl text-[#8b949e] px-1 pb-1">/</span>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-semibold text-white mb-2">Repository name <span className="text-red-400">*</span></label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl text-white focus-visible:ring-indigo-500/50 h-[40px]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
             <label className="block text-sm font-semibold text-white">Privacy</label>
             <div className="flex items-center gap-2">
               <input type="radio" id="public" name="privacy" checked={!isPrivate} onChange={() => setIsPrivate(false)} className="accent-indigo-500 cursor-pointer" />
               <label htmlFor="public" className="text-sm font-semibold text-white cursor-pointer">Public</label>
             </div>
             <p className="text-xs text-[#8b949e] ml-5">Anyone on the internet can see this repository. You choose who can commit.</p>

             <div className="flex items-center gap-2 mt-2">
               <input type="radio" id="private" name="privacy" checked={isPrivate} onChange={() => setIsPrivate(true)} className="accent-indigo-500 cursor-pointer" />
               <label htmlFor="private" className="text-sm font-semibold text-white cursor-pointer">Private</label>
             </div>
             <p className="text-xs text-[#8b949e] ml-5">You choose who can see and commit to this repository.</p>
          </div>

          <div className="border-t border-[#2d2623] pt-6 mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold border-none transition-all flex items-center justify-center gap-2 cursor-pointer rounded-full px-6 shadow-[0_0_10px_rgba(231,158,107,0.2)] active:scale-95"
            >
              {isLoading ? 'Importing...' : (
                <>
                  <DownloadCloud className="w-4 h-4 text-zinc-950" />
                  Begin import
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ImportRepoPage() {
  return (
    <ProtectedRoute>
      <ImportRepo />
    </ProtectedRoute>
  );
}
