"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, Star, GitFork, Users, ArrowUpRight, 
  RotateCw, ArrowRight, Lock, Globe, Code2, FileCode 
} from 'lucide-react';

interface ProjectCardProps {
  repo: {
    _id: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
    owner?: {
      _id?: string;
      username: string;
      avatar?: string;
    };
    collaborators?: any[];
    stars?: any[];
    forksCount?: number;
    files?: any[];
    commits?: any[];
    updatedAt?: string;
  };
  onStar?: (repoId: string) => void;
  isStarred?: boolean;
  className?: string;
}

export default function ProjectCard({ repo, onStar, isStarred, className = "" }: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Infer actual tech languages from files in repo
  const detectedTags = React.useMemo(() => {
    if (!repo.files || repo.files.length === 0) return ['Empty Repo'];
    const exts = new Set<string>();
    repo.files.forEach((f: any) => {
      const p = f.path || '';
      if (p.endsWith('.ts') || p.endsWith('.tsx')) exts.add('TypeScript');
      else if (p.endsWith('.js') || p.endsWith('.jsx')) exts.add('JavaScript');
      else if (p.endsWith('.py')) exts.add('Python');
      else if (p.endsWith('.css') || p.endsWith('.scss')) exts.add('CSS');
      else if (p.endsWith('.html')) exts.add('HTML');
      else if (p.endsWith('.md')) exts.add('Markdown');
      else if (p.endsWith('.json')) exts.add('JSON');
      else if (p.endsWith('.go')) exts.add('Go');
      else if (p.endsWith('.rs')) exts.add('Rust');
      else if (p.endsWith('.cpp') || p.endsWith('.c')) exts.add('C++');
    });
    return Array.from(exts).slice(0, 3);
  }, [repo.files]);

  return (
    <div
      className={`flip-card ${isFlipped ? 'flipped' : ''} ${className}`}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className="flip-card-inner h-full min-h-[300px]">
        
        {/* ==========================================
            FRONT SIDE (Frosted Glass with Image 2 Vibe)
        ========================================== */}
        <div className="flip-card-front glass-card p-6 flex flex-col justify-between overflow-hidden bg-white/90 border border-white/80 shadow-[0_16px_36px_rgba(0,0,0,0.05)]">
          
          {/* Top Row: Owner & Pill Badge */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FFB800] flex items-center justify-center text-xs font-black text-[#111827] shadow-sm overflow-hidden shrink-0">
                  {repo.owner?.avatar ? (
                    <img src={repo.owner.avatar} alt={repo.owner.username} className="w-full h-full object-cover" />
                  ) : (
                    repo.owner?.username ? repo.owner.username.charAt(0).toUpperCase() : 'D'
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block truncate">
                    {repo.owner?.username || 'developer'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                  repo.isPrivate
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    : 'bg-red-50 text-[#EA384C] border border-red-200/60'
                }`}
              >
                {repo.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {repo.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            {/* Title */}
            <Link href={`/repo/${repo._id}`} className="block group">
              <h3 className="font-display font-extrabold text-xl text-[#111827] group-hover:text-[#EA384C] transition-colors line-clamp-1 mb-2">
                {repo.name}
              </h3>
            </Link>

            {/* Description */}
            <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
              {repo.description || 'Modern collaborative coding project.'}
            </p>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {detectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStar) {
                    onStar(repo._id);
                  }
                }}
                className={`inline-flex items-center gap-1 hover:text-[#EA384C] transition-colors cursor-pointer ${
                  isStarred ? 'text-[#EA384C]' : 'text-gray-500'
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-[#EA384C]' : ''}`} />
                <span>{repo.stars?.length || 0}</span>
              </button>

              <span className="inline-flex items-center gap-1 text-gray-400">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repo.forksCount || 0}</span>
              </span>
            </div>

            {/* Flip Trigger Button (Cute Red Arrow Badge like Image 2) */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-8 h-8 rounded-full bg-[#EA384C] hover:bg-[#D3283C] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(234,56,76,0.3)] transition-transform hover:rotate-45 cursor-pointer"
              title="Flip for details"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ==========================================
            BACK SIDE (Flip Animation Details)
        ========================================== */}
        <div className="flip-card-back glass-card p-6 flex flex-col justify-between bg-gradient-to-br from-[#FFF8F8] to-[#FFFBF0] border-2 border-[#EA384C]/20 shadow-[0_20px_45px_rgba(234,56,76,0.08)]">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA384C] animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-[#EA384C]">
                  Project Overview
                </span>
              </div>
              <button
                onClick={() => setIsFlipped(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                title="Flip back"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-display font-extrabold text-lg text-[#111827] mb-2 truncate">
              {repo.name}
            </h4>

            {/* Project Quick Stats */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="bg-white/80 p-2.5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-bold">Files Tracked</span>
                <span className="font-display font-extrabold text-base text-[#111827]">
                  {repo.files?.length || 0} files
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-bold">Total Commits</span>
                <span className="font-display font-extrabold text-base text-[#111827]">
                  {repo.commits?.length || 0} commits
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              Includes real-time Monaco Code Editor, live Socket.io presence, and Gemini AI assistant.
            </p>
          </div>

          {/* Launch Studio Button */}
          <div className="pt-3">
            <Link
              href={`/repo/${repo._id}`}
              className="btn-pill-red w-full py-2.5 text-xs font-bold text-center block shadow-[0_8px_20px_rgba(234,56,76,0.3)]"
            >
              Launch Studio Workspace →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
