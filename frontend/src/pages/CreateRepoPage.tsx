import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FolderGit2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CreateRepoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (res.ok) {
        const newRepo = await res.json();
        navigate(`/repo/${newRepo._id}`);
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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-b border-[#30363d] pb-6 mb-6">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Create a new repository</h1>
          <p className="text-[#8b949e] mt-2">
            A repository contains all project files, including the revision history. Already have a project repository elsewhere?
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Owner</label>
              <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 flex items-center gap-2 cursor-not-allowed opacity-80">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white">{user?.username}</span>
              </div>
            </div>
            <span className="text-2xl text-[#8b949e] px-1 pb-1">/</span>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-semibold text-white mb-2">Repository name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-[#8b949e] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full max-w-xl bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
            />
          </div>

          <div className="border-t border-[#30363d] pt-6 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : (
                <>
                  <FolderGit2 className="w-4 h-4" />
                  Create repository
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
