"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { SparkleStar } from './DecorativeShapes';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  accentColor?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  accentColor = "#FFB800",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`relative w-full max-w-lg mx-auto my-8 p-8 md:p-10 rounded-3xl glass-card bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E2E0DB] dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] text-center flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {/* Center Icon badge */}
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-white/80 dark:border-white/10"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
      )}

      {/* Heading */}
      <h3 className="font-display text-2xl md:text-3xl font-extrabold text-[#1C1917] dark:text-white tracking-tight mb-2">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="font-sans text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed font-normal">
        {description}
      </p>

      {/* Optional action */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-pill-red px-7 py-3 text-xs font-bold cursor-pointer shadow-[0_8px_20px_rgba(183,25,75,0.3)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
