"use client";

import React from 'react';

// Hand-drawn wavy squiggle (inspired by Reference 1 dividers)
export function Squiggle({ className = "text-[#1A1A1A]", width = 80, height = 12 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2 8C7 2 12 14 17 8C22 2 27 14 32 8C37 2 42 14 47 8C52 2 57 14 62 8C67 2 72 14 77 8C82 2 87 14 92 8C95 4 98 12 99 8"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Hand-drawn curved arrow pointing to content
export function CurvedArrow({ className = "text-[#1A1A1A]", direction = "left" }: { className?: string; direction?: "left" | "right" }) {
  return (
    <svg
      width="64"
      height="48"
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${direction === "left" ? "scale-x-[-1]" : ""}`}
    >
      <path
        d="M8 8C20 6 48 14 52 34M52 34L42 28M52 34L56 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

// Splash droplets (inspired by yellow/blue splashes in Reference 1)
export function SplashDroplets({ color = "#6DA8DC", className = "" }: { color?: string; className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M24 4C24 4 14 18 14 26C14 31.5228 18.4772 36 24 36C29.5228 36 34 31.5228 34 26C34 18 24 4 24 4Z"
        fill={color}
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />
      <circle cx="8" cy="38" r="4" fill={color} stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="40" cy="36" r="3" fill={color} stroke="#1A1A1A" strokeWidth="2" />
    </svg>
  );
}

// Sparkle Star (4-point retro star)
export function SparkleStar({ color = "#FFCA29", size = 32, className = "" }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16 0C16 8.83656 23.1634 16 32 16C23.1634 16 16 23.1634 16 32C16 23.1634 8.83656 16 0 16C8.83656 16 16 8.83656 16 0Z"
        fill={color}
        stroke="#1A1A1A"
        strokeWidth="2"
      />
    </svg>
  );
}

// Peel-off Badge Sticker (inspired by "30% DISCOUNT" / "25% DISCOUNT" stickers in Reference 1)
export function PeelBadge({
  text,
  subtext,
  color = "#FFCA29",
  className = ""
}: {
  text: string;
  subtext?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-full border-2 border-[#1A1A1A] px-3.5 py-2 text-center font-bold shadow-[3px_4px_0px_#1A1A1A] select-none ${className}`}
      style={{ backgroundColor: color }}
    >
      <span className="text-xs uppercase tracking-wider text-[#1A1A1A] font-extrabold leading-tight">
        {text}
      </span>
      {subtext && (
        <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/80 font-bold">
          {subtext}
        </span>
      )}
      {/* Peeled bottom corner accent */}
      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white/70 rounded-tl-md border-t-2 border-l-2 border-[#1A1A1A] rotate-45 pointer-events-none" />
    </div>
  );
}
