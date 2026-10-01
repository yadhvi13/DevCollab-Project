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
      <div className="flip-card-inner h-full min-h-[290px]">
        
        {/* ==========================================
            FRONT SIDE
        ========================================== */}
        <div className="flip-card-front p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#121316] border border-[#E2E0DB] dark:border-zinc-800 shadow-xs rounded-2xl">
          
          {/* Top Row: Owner & Pill Badge */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#B7194B] flex items-center justify-center text-xs font-black text-white shadow-sm overflow-hidden shrink-0">
                  {repo.owner?.avatar ? (
                    <img src={repo.owner.avatar} alt={repo.owner.username} className="w-full h-full object-cover" />
                  ) : (
                    repo.owner?.username ? repo.owner.username.charAt(0).toUpperCase() : 'D'
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1C1917] dark:text-zinc-200 block truncate max-w-[120px]">
                    {repo.owner?.username || 'developer'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  repo.isPrivate
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {repo.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {repo.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            {/* Title */}
            <Link href={`/repo/${repo._id}`} className="block group">
              <h3 className="font-display font-extrabold text-lg text-[#1C1917] dark:text-white group-hover:text-[#B7194B] transition-colors line-clamp-1 mb-1.5">
                {repo.name}
              </h3>
            </Link>

            {/* Description */}
            <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
              {repo.description || 'Modern collaborative coding project.'}
            </p>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1 mb-3">
              {detectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-[#E2E0DB] dark:border-zinc-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-3 border-t border-[#E2E0DB] dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStar) {
                    onStar(repo._id);
                  }
                }}
                className={`inline-flex items-center gap-1 hover:text-[#B7194B] transition-colors cursor-pointer ${
                  isStarred ? 'text-[#B7194B]' : 'text-zinc-500'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-[#B7194B]' : ''}`} />
                <span>{repo.stars?.length || 0}</span>
              </button>

              <span className="inline-flex items-center gap-1 text-zinc-400 text-xs">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repo.forksCount || 0}</span>
              </span>
            </div>

            {/* Flip Trigger Button */}
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-7 h-7 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white flex items-center justify-center shadow-xs transition-transform hover:rotate-45 cursor-pointer"
              title="Flip for details"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ==========================================
            BACK SIDE
        ========================================== */}
        <div className="flip-card-back p-5 sm:p-6 flex flex-col justify-between bg-stone-50 dark:bg-zinc-900 border border-[#B7194B]/30 shadow-md rounded-2xl">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B7194B] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B7194B]">
                  Repository Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Flip back"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#1C1917] dark:text-zinc-300 font-semibold mb-3">
              {repo.name}
            </p>

            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Files</span>
                <span className="font-mono text-[11px] font-bold text-[#1C1917] dark:text-white">{repo.files?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Commits</span>
                <span className="font-mono text-[11px] font-bold text-[#1C1917] dark:text-white">{repo.commits?.length || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Collaborators</span>
                <span className="font-mono text-[11px] font-bold text-[#1C1917] dark:text-white">{repo.collaborators?.length || 0}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/repo/${repo._id}`}
            className="w-full py-2 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold text-center block transition-all hover:scale-105"
          >
            Launch in Workspace →
          </Link>

        </div>

      </div>
    </div>
  );
}
