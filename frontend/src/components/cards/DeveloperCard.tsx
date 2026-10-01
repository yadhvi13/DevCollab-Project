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
      className={`glass-card p-6 flex flex-col justify-between group relative overflow-hidden bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_16px_36px_rgba(0,0,0,0.04)] rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_rgba(234,56,76,0.1)] ${className}`}
    >
      <div>
        {/* Avatar & Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FFB800] to-[#FFE072] flex items-center justify-center font-display text-lg font-black text-[#111827] shadow-sm overflow-hidden shrink-0 border-2 border-white">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username || 'Developer'} className="w-full h-full object-cover" />
                ) : (
                  (user.username && user.username.trim().charAt(0).toUpperCase()) || 'D'
                )}
              </div>
              {/* Cute Verified / Online Checkmark Badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-[#111827] tracking-tight group-hover:text-[#EA384C] transition-colors line-clamp-1">
                {(user.username && user.username.trim()) || 'Developer'}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold">
                  <Zap className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                  Lvl {user.level || 1}
                </span>
                <span className="text-gray-400 font-semibold">{user.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {user.openToWork && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              <Briefcase className="w-3 h-3" /> Available
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {user.bio || 'Developer on DevCollab building creative and collaborative software.'}
        </p>

        {/* Skills */}
        {combinedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {combinedSkills.map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100/80 text-gray-700 border border-gray-200/50"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-400">Verified Member</span>
        <Link
          href={`/profile?u=${encodeURIComponent((user.username && user.username.trim()) || '')}`}
          className="btn-pill-red text-xs py-1.5 px-4 shadow-[0_6px_16px_rgba(234,56,76,0.25)] hover:scale-105"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
