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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-lg glass-card p-6 md:p-8 bg-white/95 backdrop-blur-2xl border border-white/95 shadow-[0_25px_60px_rgba(0,0,0,0.1)] rounded-3xl relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111827] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EA384C] flex items-center justify-center text-white shadow-sm">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#111827]">Create New Project</h2>
                <p className="font-sans text-xs text-gray-500">Start building your repository workspace</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#EA384C]">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Project / Repo Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. awesome-next-app"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2.5 px-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] focus:bg-white text-[#111827]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What are you building?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] focus:bg-white text-[#111827] resize-none"
                />
              </div>

              {/* Visibility Choice */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsPrivate(false)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      !isPrivate
                        ? 'bg-red-50/70 border-[#EA384C] text-[#EA384C] shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Globe className="w-4 h-4" /> Public
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Anyone can explore and collaborate</p>
                  </div>

                  <div
                    onClick={() => setIsPrivate(true)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isPrivate
                        ? 'bg-amber-50/70 border-[#FFB800] text-amber-800 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Lock className="w-4 h-4" /> Private
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Only you and collaborators can view</p>
                  </div>
                </div>
              </div>

              {/* README Checkbox */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={initReadme}
                  onChange={(e) => setInitReadme(e.target.checked)}
                  className="w-4 h-4 accent-[#EA384C] rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">
                  Initialize project with a README.md file
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                  className="btn-pill-red px-6 py-2 text-xs font-bold cursor-pointer disabled:opacity-50 shadow-[0_8px_20px_rgba(234,56,76,0.3)]"
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
