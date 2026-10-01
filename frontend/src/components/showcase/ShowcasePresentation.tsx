"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  FolderGit2,
  GitBranch,
  GitCommit,
  Users,
  FileCode,
  CheckCircle2,
  Send,
  Terminal,
  ChevronDown,
  Layers,
  MessageSquare,
  Sparkles,
  Zap,
  Radio,
  FileText,
  Clock,
  Circle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';

// Dynamically import Monaco Editor with ssr: false
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col items-center justify-center text-sm text-zinc-400 font-mono gap-2 p-8">
      <div className="w-6 h-6 border-2 border-[#B7194B] border-t-transparent rounded-full animate-spin" />
      <span>Initializing Monaco IDE...</span>
    </div>
  ),
});

const SAMPLE_DEVCOLLAB_CODE = `import { useSocket } from '@/contexts/SocketContext';
import { useState, useEffect } from 'react';

/**
 * DevCollab Real-time Room Sync Engine
 * Broadcasts AST buffer mutations and remote cursor coordinates across peers.
 */
export function DevCollabEngine({ repoId }: { repoId: string }) {
  const { socket, liveUsers } = useSocket();
  const [syncedBuffer, setSyncedBuffer] = useState('');
  const [activePeers, setActivePeers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-workspace', { repoId });

    socket.on('peer-presence', (peers: string[]) => {
      setActivePeers(peers);
    });

    socket.on('buffer-delta', (delta: { offset: number; text: string }) => {
      setSyncedBuffer((prev) => prev.slice(0, delta.offset) + delta.text);
    });

    return () => {
      socket.emit('leave-workspace', { repoId });
    };
  }, [socket, repoId]);

  return (
    <div className="live-editor-runtime flex flex-col h-full">
      <MonacoLiveView activeUsers={liveUsers} buffer={syncedBuffer} peers={activePeers} />
    </div>
  );
}`;

export default function ShowcasePresentation() {
  const router = useRouter();
  const { user } = useAuth();

  // Real data state
  const [publicRepos, setPublicRepos] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  // Window height tracking for full-display vertical scrolling
  const [windowHeight, setWindowHeight] = useState(900);

  // Animation & interactive control state
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [manualY, setManualY] = useState(0);

  // Fetch real API data
  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      try {
        const [repoRes, userRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/repos?type=public`),
          fetch(`${API_BASE_URL}/api/users`)
        ]);

        if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
          const repos = await repoRes.value.json();
          if (isSubscribed && Array.isArray(repos) && repos.length > 0) {
            setPublicRepos(repos);
          }
        }

        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          const users = await userRes.value.json();
          if (isSubscribed && Array.isArray(users) && users.length > 0) {
            setActiveUsers(users);
          }
        }
      } catch (err) {
        // Fallbacks are built-in
      }
    };
    fetchData();
    return () => { isSubscribed = false; };
  }, []);

  // Update window height dynamically for full display scrolling
  useEffect(() => {
    const updateDimensions = () => {
      setWindowHeight(window.innerHeight || 900);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle floating Back button
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  // Section navigation targets (each section is 100vh)
  const sectionItems = [
    { name: 'Hero', offset: 0 },
    { name: 'Project', offset: windowHeight * 1 },
    { name: 'Repository', offset: windowHeight * 2 },
    { name: 'Editor', offset: windowHeight * 3 },
    { name: 'Collab & Chat', offset: windowHeight * 4 },
  ];

  const jumpToSection = (yOffset: number, index: number) => {
    setManualY(-yOffset);
    setCurrentSectionIndex(index);
    setIsPaused(true);
  };

  // Full-display vertical timeline matching the 9.4-second specification:
  // 0.0s — 1.0s: Hero hold at 0
  // 1.0s — 2.2s: Start scroll to Project section
  // 2.2s — 3.5s: Continue scroll / Project section view
  // 3.5s — 4.8s: Second scroll to Repository section
  // 4.8s — 6.2s: Continue through Code Editor section
  // 6.2s — 7.0s: Final section: Kanban & Chat
  // 7.0s — 7.8s: Return movement (fast return)
  // 7.8s — 8.7s: Return to Hero
  // 8.7s — 9.4s: Hero hold, then repeat seamlessly
  const timelineY = [
    0,
    0,
    -windowHeight * 0.45,
    -windowHeight * 1,
    -windowHeight * 2,
    -windowHeight * 3,
    -windowHeight * 4,
    -windowHeight * 1.5,
    0,
    0,
  ];

  // Subtle depth scale effect (1.0 -> 0.99 during movement, 1.0 during hold)
  const timelineScale = [
    1.0,
    1.002,
    0.995,
    0.995,
    0.995,
    0.995,
    0.995,
    0.998,
    1.0,
    1.0,
  ];

  const timelineTimes = [
    0,
    1.0 / 9.4,   // 0.106
    2.2 / 9.4,   // 0.234
    3.5 / 9.4,   // 0.372
    4.8 / 9.4,   // 0.510
    6.2 / 9.4,   // 0.660
    7.0 / 9.4,   // 0.745
    7.8 / 9.4,   // 0.830
    8.7 / 9.4,   // 0.925
    1.0,         // 1.000
  ];

  // Primary repo details
  const primaryRepo = publicRepos[0] || {
    name: 'devcollab-core',
    description: 'Real-time collaborative developer workspace engine and AST buffer synchronizer.',
    stars: 38,
    forks: 12,
    files: [
      { name: 'src/editor/MonacoSync.tsx', type: 'file', commit: 'Monaco multi-cursor buffer sync engine', time: '12m ago' },
      { name: 'src/socket/roomManager.ts', type: 'file', commit: 'WebSocket room presence and event bus', time: '45m ago' },
      { name: 'src/kanban/BoardContext.tsx', type: 'file', commit: 'Dnd-kit drag state persistence', time: '2h ago' },
      { name: 'package.json', type: 'file', commit: 'DevCollab v2.4 dependencies and scripts', time: '1d ago' },
      { name: 'README.md', type: 'file', commit: 'Real-time team collaboration guidelines', time: '3d ago' },
    ]
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-[#090909] text-white overflow-hidden select-none z-0">
      
      {/* ========================================================
          1. FLOATING BACK BUTTON (Stationary in upper-left)
          Position: top: 20px, left: 20px
          Size: ~60px × 60px
          Shape: perfect circle
          Background: #FFFFFF
          Icon: black ArrowLeft
          Normal: scale 1, Hover: scale 1.05, Active: scale 0.95
          Transition: 180ms - 220ms ease-out (no bounce)
      ======================================================== */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="fixed top-5 left-5 z-50 w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer text-black transition-transform duration-200 ease-out hover:scale-105 active:scale-95 border-0 focus:outline-none"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.4] text-black" />
      </button>

      {/* ========================================================
          2. FULL-DISPLAY CINEMATIC MOTION STAGE
          Spans 100% of display width and height (NO small box!)
          The internal website content moves vertically with
          smooth cubic-bezier(0.76, 0, 0.24, 1) scroll easing.
      ======================================================== */}
      <div className="w-full h-full overflow-hidden relative">
        <motion.div
          className="w-full will-change-transform flex flex-col"
          style={{
            transform: 'translate3d(0, 0, 0)',
          }}
          animate={
            isPaused
              ? { y: manualY, scale: 1.0 }
              : {
                  y: timelineY,
                  scale: timelineScale,
                }
          }
          transition={
            isPaused
              ? {
                  duration: 0.6,
                  ease: [0.76, 0, 0.24, 1],
                }
              : {
                  duration: 9.4,
                  repeat: Infinity,
                  ease: [0.76, 0, 0.24, 1],
                  times: timelineTimes,
                }
          }
        >

          {/* ====================================================
              SECTION 1: FULL-DISPLAY DEV COLLAB HERO
              Background: #090909 (Dark, cinematic, editorial)
              Typography: White, Accent: Burgundy (#B7194B)
          ==================================================== */}
          <section className="w-full h-screen min-h-[640px] bg-[#090909] text-white flex flex-col justify-between p-6 sm:p-12 relative border-b border-zinc-800">
            
            {/* Top Navbar Spanning Display */}
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto pt-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3 pl-16 sm:pl-20">
                <div className="w-9 h-9 rounded-xl bg-[#B7194B] flex items-center justify-center font-black text-sm text-white shadow-md">
                  DC
                </div>
                <div>
                  <span className="font-display font-extrabold text-base tracking-wider text-white block">
                    DEV COLLAB
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Real-time Workspace
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
                <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                <Link href="/explore" className="hover:text-white transition-colors">Repositories</Link>
                <Link href="/feed" className="hover:text-white transition-colors">Community</Link>
                <span className="hover:text-white transition-colors cursor-pointer">Documentation</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  v2.4 Live
                </span>
                <Link
                  href={user ? "/dashboard" : "/auth"}
                  className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all duration-180 hover:scale-105 active:scale-95"
                >
                  {user ? "Dashboard" : "Sign In"}
                </Link>
              </div>
            </div>

            {/* Hero Main Content */}
            <div className="max-w-7xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Bold Editorial Headline & CTAs */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B7194B]/20 border border-[#B7194B]/40 text-[#ff6188] text-xs font-black uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6188]" />
                  Collaborative Builder Platform
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-white tracking-tight uppercase">
                  COLLABORATE.<br />
                  CODE.<br />
                  <span className="text-[#B7194B]">SHIP TOGETHER.</span>
                </h1>

                <p className="font-sans text-base sm:text-lg text-zinc-400 font-normal leading-relaxed mt-5 max-w-xl">
                  A real-time workspace for developers to build, review and ship projects together. Live Monaco editor, multi-peer socket sync, and agile task boards in one place.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <Link
                    href={user ? "/dashboard" : "/auth"}
                    className="px-8 py-3.5 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white font-bold text-sm sm:text-base transition-all duration-180 hover:scale-105 active:scale-95 shadow-[0_12px_28px_rgba(183,25,75,0.35)] flex items-center gap-2"
                  >
                    <span>GET STARTED</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                  <Link
                    href="/explore"
                    className="px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-sm sm:text-base transition-all duration-180 hover:scale-105 active:scale-95"
                  >
                    EXPLORE PROJECTS
                  </Link>
                </div>
              </div>

              {/* Right Column: Sleek Real-Time Collaboration Terminal Graphic */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      collaborate.ts
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">● Live Room</span>
                  </div>

                  <div className="font-mono text-xs text-zinc-300 leading-relaxed space-y-2">
                    <p><span className="text-pink-400">const</span> workspace = <span className="text-yellow-300">new</span> <span className="text-cyan-300">DevCollabWorkspace</span>&#40;&#123;</p>
                    <p className="pl-4 text-zinc-400">roomId: <span className="text-emerald-300">'core-engine'</span>,</p>
                    <p className="pl-4 text-zinc-400">monacoLiveSync: <span className="text-pink-400">true</span>,</p>
                    <p className="pl-4 text-zinc-400">maxPeers: <span className="text-amber-300">8</span></p>
                    <p>&#125;&#41;;</p>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold border border-pink-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                        Sarah typing Line 14...
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                        Alex synced
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom trust bar */}
            <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between pt-4 border-t border-white/10 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Monaco IDE Buffer Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Socket.io Multi-Peer Networking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Drag & Drop Kanban
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Real Production Code
              </span>
            </div>

          </section>

          {/* ====================================================
              SECTION 2: FULL-DISPLAY PROJECT & ARCHITECTURE SECTION
              Background: #F4F2EF (Clean white/cream editorial)
              Large black typography, 5 pillars, impactful metrics
          ==================================================== */}
          <section className="w-full h-screen min-h-[640px] bg-[#F4F2EF] text-[#111827] flex flex-col justify-between p-6 sm:p-14 border-b border-zinc-300">
            
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-zinc-300 pb-3">
              <div className="flex items-center gap-2 pl-16 sm:pl-20">
                <span className="w-2 h-2 rounded-full bg-[#B7194B]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#B7194B]">
                  Workspace Architecture
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                DevCollab Platform • Engineered for Teams
              </span>
            </div>

            <div className="max-w-7xl mx-auto w-full my-auto py-6">
              <h2 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#111827] uppercase tracking-tight">
                BUILD TOGETHER.<br />
                <span className="text-[#B7194B]">SHIP FASTER.</span>
              </h2>

              <p className="font-sans text-base sm:text-lg text-zinc-600 font-medium leading-relaxed mt-4 max-w-2xl">
                DevCollab synchronizes code buffers, AST diffs, task columns, and developer chat across a single high-performance workspace.
              </p>

              {/* 5 Core Pillars in Full-Width Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
                {[
                  { label: 'Real-time Collaboration', desc: 'Instant multi-cursor synchronization with zero lag.', icon: Radio },
                  { label: 'Repository Management', desc: 'Full branch tracking, commit logs, and file explorer.', icon: FolderGit2 },
                  { label: 'Live Code Editing', desc: 'Integrated Monaco IDE with intelligent syntax highlighting.', icon: FileCode },
                  { label: 'Task Management', desc: 'Agile Kanban boards synced across the entire team.', icon: Layers },
                  { label: 'Team Communication', desc: 'Low-latency Socket.io room chat and audio discussions.', icon: MessageSquare },
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#B7194B] mb-3">
                        <pillar.icon className="w-5 h-5 text-[#B7194B]" />
                      </div>
                      <h3 className="text-sm font-extrabold text-zinc-900 mb-1 leading-snug">
                        {pillar.label}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full-Width Stat Metrics Bar */}
            <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-zinc-300 text-center">
              <div>
                <span className="block font-display font-extrabold text-3xl sm:text-4xl text-[#111827]">2,400+</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Repositories</span>
              </div>
              <div>
                <span className="block font-display font-extrabold text-3xl sm:text-4xl text-[#111827]">18,500+</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verified Commits</span>
              </div>
              <div>
                <span className="block font-display font-extrabold text-3xl sm:text-4xl text-[#B7194B]">99.9%</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Live Sync Uptime</span>
              </div>
              <div>
                <span className="block font-display font-extrabold text-3xl sm:text-4xl text-[#111827]">12ms</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">WebSocket Latency</span>
              </div>
            </div>

          </section>

          {/* ====================================================
              SECTION 3: FULL-DISPLAY REPOSITORY PREVIEW
              Background: #121316 (Polished dark GitHub style)
              Full repository layout, files, commits, contributors
          ==================================================== */}
          <section className="w-full h-screen min-h-[640px] bg-[#121316] text-zinc-200 flex flex-col justify-between p-6 sm:p-14 border-b border-zinc-800">
            
            <div className="max-w-7xl mx-auto w-full">
              
              {/* Repo Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3 pl-16 sm:pl-20">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#B7194B]">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg sm:text-xl text-white">
                        devcollab / <span className="text-[#ff7597]">{primaryRepo.name}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">
                        Public
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {primaryRepo.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                    <span>main</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <Link
                    href="/explore"
                    className="px-4 py-1.5 rounded-lg bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold transition-all duration-180 hover:scale-105"
                  >
                    Fork Repository
                  </Link>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium pb-3 border-b border-zinc-800/80">
                <span className="flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4 text-zinc-400" /> 12 commits
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-zinc-400" /> 8 contributors
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" /> 24 files
                </span>
                <span className="flex items-center gap-1.5 ml-auto text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time synchronization active
                </span>
              </div>

              {/* Repo Tabs */}
              <div className="flex items-center gap-6 text-xs font-bold border-b border-zinc-800 pt-3 pb-2 text-zinc-400">
                <span className="text-white border-b-2 border-[#B7194B] pb-2 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#B7194B]" /> Code
                </span>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">Branches (3)</span>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">Issues (3)</span>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">Pull Requests (1)</span>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">Actions</span>
              </div>

            </div>

            {/* Repo File Tree Table */}
            <div className="max-w-7xl mx-auto w-full my-auto">
              <div className="bg-zinc-950/70 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                <div className="bg-zinc-900/90 px-5 py-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-300 font-semibold">Yadhvi:</span>
                    <span>feat: real-time collaborative code sync & terminal preview</span>
                  </div>
                  <span className="font-mono text-zinc-500">Latest commit 14 mins ago</span>
                </div>

                <div className="divide-y divide-zinc-800/80">
                  {(primaryRepo.files || []).map((file: any, fIdx: number) => (
                    <div key={fIdx} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        {file.type === 'dir' ? (
                          <FolderGit2 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <FileCode className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="font-mono text-zinc-200 font-medium">{file.name}</span>
                      </div>
                      <span className="text-zinc-400 font-sans truncate max-w-md hidden md:block">
                        {file.commit}
                      </span>
                      <span className="text-zinc-500 font-mono text-xs">
                        {file.time || '1d ago'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800">
              <span>DevCollab Git Engine • Verified GPG Commits</span>
              <Link href="/explore" className="text-[#ff7597] hover:underline flex items-center gap-1 font-semibold">
                Explore All Community Repositories →
              </Link>
            </div>

          </section>

          {/* ====================================================
              SECTION 4: FULL-DISPLAY MONACO EDITOR IDE
              Background: #1e1e1e (Real VS-Dark Monaco IDE)
              Tabs, sidebar, full code editor, line numbers
          ==================================================== */}
          <section className="w-full h-screen min-h-[640px] bg-[#1e1e1e] text-zinc-200 flex flex-col justify-between p-6 sm:p-14 border-b border-zinc-800">
            
            <div className="max-w-7xl mx-auto w-full">
              
              {/* Window Title & Tabs */}
              <div className="flex items-center justify-between bg-[#252526] px-4 py-2.5 rounded-t-xl border border-zinc-700/60">
                <div className="flex items-center gap-3 pl-16 sm:pl-20">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>

                  {/* Multi Tabs */}
                  <div className="flex items-center gap-1 ml-4">
                    <span className="px-3.5 py-1 rounded bg-[#1e1e1e] text-white font-mono text-xs border-t-2 border-t-[#B7194B] flex items-center gap-1.5 shadow-sm">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      DevCollabEngine.tsx
                    </span>
                    <span className="px-3 py-1 text-zinc-400 font-mono text-xs hover:text-white transition-colors cursor-pointer">
                      useSocket.ts
                    </span>
                    <span className="px-3 py-1 text-zinc-400 font-mono text-xs hover:text-white transition-colors cursor-pointer">
                      server.js
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    4 Active Collaborators
                  </span>
                </div>
              </div>

              {/* IDE Workspace Frame */}
              <div className="w-full bg-[#1e1e1e] border-x border-zinc-700/60 overflow-hidden relative" style={{ height: 'calc(100vh - 280px)', minHeight: '340px' }}>
                <MonacoEditor
                  height="100%"
                  language="typescript"
                  theme="vs-dark"
                  value={SAMPLE_DEVCOLLAB_CODE}
                  options={{
                    readOnly: false,
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    fontFamily: "'Space Mono', monospace",
                    overviewRulerBorder: false,
                    lineDecorationsWidth: 6,
                    lineNumbersMinChars: 3,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>

              {/* Monaco IDE Status Bar */}
              <div className="bg-[#007acc] text-white px-4 py-1.5 rounded-b-xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                  <span>TypeScript React</span>
                  <span>UTF-8</span>
                  <span>Ln 18, Col 32</span>
                  <span>Spaces: 2</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Git: main</span>
                  <span>DevCollab AST Engine ✓</span>
                </div>
              </div>

            </div>

            <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-zinc-500 pt-3">
              <span>Interactive Monaco IDE preview • Edits sync in real time</span>
              <Link href={user ? "/dashboard" : "/auth"} className="text-cyan-400 hover:underline">
                Launch Full IDE Workspace →
              </Link>
            </div>

          </section>

          {/* ====================================================
              SECTION 5: FULL-DISPLAY KANBAN & CHAT COLLABORATION
              Background: #0e0f12 (Dark collaborative dashboard)
              TODO, IN PROGRESS, REVIEW, DONE columns + Live Chat
          ==================================================== */}
          <section className="w-full h-screen min-h-[640px] bg-[#0e0f12] text-zinc-200 flex flex-col justify-between p-6 sm:p-14">
            
            <div className="max-w-7xl mx-auto w-full">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3 pl-16 sm:pl-20">
                  <div className="w-9 h-9 rounded-xl bg-[#B7194B] flex items-center justify-center text-white">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-wider">
                      Sprint Kanban & Live Room Chat
                    </h2>
                    <span className="text-xs text-zinc-400">
                      Collaborative tasks synced via Socket.io event bus
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time Sync Active</span>
                </div>
              </div>

            </div>

            {/* Main Section Content: 4 Kanban Columns + Live Chat Drawer */}
            <div className="max-w-7xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column (8 cols): 4 Column Kanban Board */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    title: 'TODO',
                    count: 3,
                    color: 'text-zinc-400',
                    task: 'WebSocket room auth tokens & handshake',
                    tag: 'High',
                    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                    user: 'YA'
                  },
                  {
                    title: 'IN PROGRESS',
                    count: 2,
                    color: 'text-amber-400',
                    task: 'Monaco multi-cursor broadcasting',
                    tag: 'Urgent',
                    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    user: 'SK'
                  },
                  {
                    title: 'REVIEW',
                    count: 1,
                    color: 'text-blue-400',
                    task: 'AST delta merging conflict detector',
                    tag: 'Review',
                    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    user: 'AM'
                  },
                  {
                    title: 'DONE',
                    count: 4,
                    color: 'text-emerald-400',
                    task: 'Full-display cinematic showcase stage',
                    tag: 'Shipped',
                    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    user: 'DC'
                  },
                ].map((col, idx) => (
                  <div key={idx} className="bg-zinc-900/80 rounded-2xl p-3 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                        <span className={`text-xs font-extrabold ${col.color}`}>
                          {col.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {col.count}
                        </span>
                      </div>

                      <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                        <p className="text-xs font-medium text-zinc-200 line-clamp-3 leading-snug">
                          {col.task}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${col.tagColor}`}>
                            {col.tag}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[#B7194B] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                            {col.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column (4 cols): Live Socket.io Team Chat */}
              <div className="lg:col-span-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#B7194B]" />
                      <span className="text-xs font-bold text-white">Live Workspace Chat</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">#general-dev</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#ff7597]">Alex</span>
                        <span className="text-[10px] text-zinc-600">10:42 AM</span>
                      </div>
                      <p className="text-zinc-300">Pushed the multi-cursor sync fix to main 🚀</p>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-400">Sarah</span>
                        <span className="text-[10px] text-zinc-600">10:43 AM</span>
                      </div>
                      <p className="text-zinc-300">Tested in Monaco, latency is sub-12ms. Looks great!</p>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-400">Yadhvi</span>
                        <span className="text-[10px] text-zinc-600">10:44 AM</span>
                      </div>
                      <p className="text-zinc-300">Merging staging into production workspace now.</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 mt-3">
                  <input
                    type="text"
                    readOnly
                    placeholder="Type message or press / to share code snippet..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Send"
                    className="p-2 rounded-xl bg-[#B7194B] text-white hover:brightness-110 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Footer */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800">
              <span>DevCollab Real-time Suite • Socket.io Active</span>
              <Link href={user ? "/dashboard" : "/auth"} className="text-[#ff7597] hover:underline font-semibold">
                Go to DevCollab Dashboard →
              </Link>
            </div>

          </section>

        </motion.div>
      </div>

      {/* ========================================================
          3. MINIMAL SHOWCASE CONTROLS & TIMELINE INDICATORS
          Subtly fixed at the bottom center of the display
          Allows pausing/resuming and jumping between sections
      ======================================================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 text-white shadow-2xl">
        
        {/* Play/Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Play" : "Pause"}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all duration-180 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Loop</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Section Jump Pills */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
          {sectionItems.map((sec, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => jumpToSection(sec.offset, idx)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-180 cursor-pointer ${
                isPaused && currentSectionIndex === idx
                  ? 'bg-white text-black font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Full App Link */}
        <Link
          href={user ? "/dashboard" : "/explore"}
          className="ml-2 pl-3 border-l border-white/20 text-xs font-bold text-white/90 hover:text-white hover:underline flex items-center gap-1.5"
        >
          <span>Open Full App</span>
          <ArrowLeft className="w-3 h-3 rotate-180" />
        </Link>
      </div>

    </main>
  );
}
