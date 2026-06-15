"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { FolderGit2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function CreateRepo() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Repository name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (res.ok) {
        const newRepo = await res.json();
        router.push(`/repo/${newRepo._id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create repository');
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Create a new repository</h1>
          <p className="text-[#8b949e] mt-2 text-sm">
            A repository contains all project files, including the revision history. Already have a project repository elsewhere?
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-end gap-2">
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
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-[#8b949e] font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full max-w-xl bg-[#0b0908]/60 border border-[#2d2623] rounded-xl text-white focus-visible:ring-indigo-500/50 h-[40px]"
            />
          </div>

          <div className="border-t border-[#2d2623] pt-6 mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold border-none transition-all flex items-center justify-center gap-2 cursor-pointer rounded-full px-6 shadow-[0_0_10px_rgba(231,158,107,0.2)] active:scale-95"
            >
              {isLoading ? 'Creating...' : (
                <>
                  <FolderGit2 className="w-4 h-4 text-zinc-950" />
                  Create repository
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateRepoPage() {
  return (
    <ProtectedRoute>
      <CreateRepo />
    </ProtectedRoute>
  );
}
