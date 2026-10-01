"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Zap, Briefcase, CheckCircle2 } from 'lucide-react';

interface DeveloperCardProps {
  user: {
    _id?: string;
    username: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
    techStack?: string[];
    level?: number;
    xp?: number;
    openToWork?: boolean;
  };
  className?: string;
}

export default function DeveloperCard({ user, className = "" }: DeveloperCardProps) {
  const combinedSkills = Array.from(new Set([...(user.skills || []), ...(user.techStack || [])])).slice(0, 4);

  return (
    <div
      className={`p-6 flex flex-col justify-between group relative overflow-hidden bg-white dark:bg-[#121316] border border-[#E2E0DB] dark:border-zinc-800 shadow-xs rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      <div>
        {/* Avatar & Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#B7194B] flex items-center justify-center font-display text-base font-black text-white shadow-sm overflow-hidden shrink-0 border border-white/20">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username || 'Developer'} className="w-full h-full object-cover" />
                ) : (
                  (user.username && user.username.trim().charAt(0).toUpperCase()) || 'D'
                )}
              </div>
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-base font-extrabold text-[#1C1917] dark:text-white tracking-tight group-hover:text-[#B7194B] transition-colors line-clamp-1">
                {(user.username && user.username.trim()) || 'Developer'}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Lvl {user.level || 1}
                </span>
                <span className="text-zinc-400 font-semibold text-[10px]">{user.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {user.openToWork && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Briefcase className="w-3 h-3" /> Available
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {user.bio || 'Developer on DevCollab building creative and collaborative software.'}
        </p>

        {/* Skills */}
        {combinedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {combinedSkills.map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-[#E2E0DB] dark:border-zinc-700/60"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-3 border-t border-[#E2E0DB] dark:border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-400">Verified Member</span>
        <Link
          href={`/profile?u=${encodeURIComponent((user.username && user.username.trim()) || '')}`}
          className="px-3.5 py-1 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold transition-all shadow-xs hover:scale-105 flex items-center gap-1"
        >
          <span>Profile</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
