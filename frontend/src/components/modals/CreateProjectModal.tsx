"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Globe, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (repo: any) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const { token } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [initReadme, setInitReadme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          isPrivate,
          initReadme
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create repository');
        setLoading(false);
        return;
      }

      setLoading(false);
      setName('');
      setDescription('');
      onClose();
      if (onCreated) {
        onCreated(data);
      }
      router.push(`/repo/${data._id}`);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-lg glass-card p-6 md:p-8 bg-white/95 dark:bg-[#121316] backdrop-blur-2xl border border-[#E2E0DB] dark:border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-3xl relative text-left"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#1C1917] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#B7194B] flex items-center justify-center text-white shadow-xs">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#1C1917] dark:text-white">Create New Project</h2>
                <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Start building your repository workspace</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-[#B7194B]/15 border border-rose-200 dark:border-[#B7194B]/30 text-xs font-bold text-[#B7194B] dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Project / Repo Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. awesome-next-app"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2.5 px-3.5 bg-gray-50 dark:bg-[#18191E] border border-gray-200/80 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-[#B7194B] focus:bg-white dark:focus:bg-[#121316] text-[#1C1917] dark:text-zinc-100 placeholder:text-zinc-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What are you building?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3.5 bg-gray-50 dark:bg-[#18191E] border border-gray-200/80 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-[#B7194B] focus:bg-white dark:focus:bg-[#121316] text-[#1C1917] dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
                />
              </div>

              {/* Visibility Choice */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsPrivate(false)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      !isPrivate
                        ? 'bg-rose-50/70 dark:bg-[#B7194B]/15 border-[#B7194B] text-[#B7194B] dark:text-rose-400 shadow-xs'
                        : 'bg-white dark:bg-[#18191E] border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Globe className="w-4 h-4" /> Public
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Anyone can explore and collaborate</p>
                  </div>

                  <div
                    onClick={() => setIsPrivate(true)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isPrivate
                        ? 'bg-amber-50/70 dark:bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-400 shadow-xs'
                        : 'bg-white dark:bg-[#18191E] border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Lock className="w-4 h-4" /> Private
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Only you and collaborators can view</p>
                  </div>
                </div>
              </div>

              {/* README Checkbox */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={initReadme}
                  onChange={(e) => setInitReadme(e.target.checked)}
                  className="w-4 h-4 accent-[#B7194B] rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Initialize project with a README.md file
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-pill-glass px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="btn-pill-red px-6 py-2 text-xs font-bold cursor-pointer disabled:opacity-50 shadow-[0_8px_20px_rgba(183,25,75,0.3)]"
                >
                  {loading ? 'Creating...' : 'Create Project →'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
