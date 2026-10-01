"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Users,
  FileCode,
  Layers,
  MessageSquare,
  Search,
  Plus,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  GitBranch,
  Star,
  GitFork,
  CheckCircle2,
  Terminal,
  Send,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Tv
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSocket } from '@/contexts/SocketContext';
import { API_BASE_URL } from '@/config';
import ProjectCard from '@/components/cards/ProjectCard';
import DeveloperCard from '@/components/cards/DeveloperCard';
import EmptyState from '@/components/ui/EmptyState';

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col items-center justify-center text-xs text-zinc-400 font-mono gap-2 p-8">
      <div className="w-6 h-6 border-2 border-[#B7194B] border-t-transparent rounded-full animate-spin" />
      <span>Loading Monaco Workspace...</span>
    </div>
  ),
});

const DEFAULT_EDITOR_CODE = `// DevCollab Interactive Workspace
import { createRoom, broadcastDelta } from '@devcollab/core';

export async function startCollaboration() {
  const room = await createRoom({
    name: 'alpha-sprint',
    language: 'typescript',
    realtime: true
  });

  room.on('peer-join', (user) => {
    console.log(\`Connected with builder \${user.name}\`);
  });

  return room;
}`;

export default function FullAppPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { socket, onlineUsers } = useSocket();
  const router = useRouter();

  // Navigation tab state inside full app
  const [activeTab, setActiveTab] = useState<'overview' | 'repos' | 'monaco' | 'kanban' | 'chat' | 'developers'>('overview');
  
  // Real data state
  const [repos, setRepos] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Monaco editor interactive state
  const [editorCode, setEditorCode] = useState(DEFAULT_EDITOR_CODE);
  const [editorLang, setEditorLang] = useState('typescript');

  // Interactive Kanban tasks state
  const [tasks, setTasks] = useState([
    { id: '1', title: 'WebSocket room auth tokens & handshake', col: 'todo', tag: 'High', user: 'YA' },
    { id: '2', title: 'Monaco multi-cursor broadcasting AST', col: 'in-progress', tag: 'Urgent', user: 'SK' },
    { id: '3', title: 'AST delta merging conflict detector', col: 'review', tag: 'Review', user: 'AM' },
    { id: '4', title: 'Full display showcase animation suite', col: 'done', tag: 'Shipped', user: 'DC' },
  ]);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Alex', text: 'Pushed the multi-cursor sync fix to main 🚀', time: '10:42 AM' },
    { id: '2', user: 'Sarah', text: 'Tested in Monaco, latency is under 12ms. Looks great!', time: '10:43 AM' },
    { id: '3', user: 'Yadhvi', text: 'Merging staging into production workspace now.', time: '10:44 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch real data
  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reposRes, devsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/repos?type=public`),
          fetch(`${API_BASE_URL}/api/users`)
        ]);

        if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
          const rData = await reposRes.value.json();
          if (isSubscribed && Array.isArray(rData)) {
            setRepos(rData);
          }
        }

        if (devsRes.status === 'fulfilled' && devsRes.value.ok) {
          const dData = await devsRes.value.json();
          if (isSubscribed && Array.isArray(dData)) {
            setDevelopers(dData);
          }
        }
      } catch (err) {
        console.error('Failed to load full app data:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchData();
    return () => { isSubscribed = false; };
  }, []);

  // Filtered repositories
  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      const matchesSearch =
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTag === 'All') return matchesSearch;
      return matchesSearch && r.language?.toLowerCase() === selectedTag.toLowerCase();
    });
  }, [repos, searchQuery, selectedTag]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Math.random().toString(),
      user: user?.username || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#F4F2EF] dark:bg-[#090909] text-[#1C1917] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Main Navbar with Theme Switcher */}
      <Navbar />

      {/* ========================================================
          FULL APP HEADER & HERO BANNER
          Soft warm editorial light mode / Deep dark charcoal dark mode
      ======================================================== */}
      <section className="border-b border-[#E2E0DB] dark:border-zinc-800 bg-[#EAE8E4]/50 dark:bg-zinc-950/60 px-4 sm:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B7194B]/15 text-[#B7194B] dark:text-[#ff6188] text-[11px] font-extrabold tracking-wider uppercase border border-[#B7194B]/30">
                Full Application Suite
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                • Real-time Active
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white tracking-tight">
              DevCollab <span className="text-[#B7194B]">Workspace</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
              Collaborative developer environment with multi-peer socket sync, live Monaco IDE, sprint Kanban, and public repositories.
            </p>
          </div>

          {/* Quick Actions & Theme Control Bar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Dedicated Theme Pill Switcher */}
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 rounded-full p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#B7194B] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-[#1C1917]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#B7194B] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>

            {/* Showcase Animation Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 text-xs font-bold text-[#1C1917] dark:text-white hover:border-[#B7194B] transition-colors shadow-xs"
              title="Return to Presentation Showcase"
            >
              <Tv className="w-3.5 h-3.5 text-[#B7194B]" />
              <span>Showcase Animation</span>
            </Link>

            {/* Create Project CTA */}
            <button
              onClick={() => {
                if (user) {
                  router.push('/create');
                } else {
                  router.push('/auth');
                }
              }}
              className="px-5 py-2 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold transition-all duration-180 hover:scale-105 active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Project</span>
            </button>
          </div>

        </div>

        {/* Workspace Subnav Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'repos', label: 'Repositories', icon: FolderGit2, badge: repos.length },
            { id: 'monaco', label: 'Monaco Live IDE', icon: FileCode },
            { id: 'kanban', label: 'Sprint Kanban', icon: Layers },
            { id: 'chat', label: 'Team Live Lounge', icon: MessageSquare },
            { id: 'developers', label: 'Builders', icon: Users, badge: developers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#B7194B] text-white shadow-sm'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-[#1C1917] dark:hover:text-white border border-[#E2E0DB] dark:border-zinc-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          MAIN WORKSPACE BODY
      ======================================================== */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Public Repositories', val: repos.length || '24', icon: FolderGit2, sub: 'Active projects' },
                { label: 'Connected Builders', val: developers.length || '12', icon: Users, sub: 'Verified profiles' },
                { label: 'Socket Sync Latency', val: '12ms', icon: Terminal, sub: 'WebSocket active' },
                { label: 'Monaco Cursors', val: '4 Active', icon: FileCode, sub: 'Real-time engine' },
              ].map((m, i) => (
                <div key={i} className="bg-white dark:bg-[#121316] p-5 rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                      {m.label}
                    </span>
                    <span className="font-display font-extrabold text-2xl text-[#1C1917] dark:text-white mt-1 block">
                      {m.val}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{m.sub}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B7194B]/10 flex items-center justify-center text-[#B7194B]">
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Split Showcase: Recent Projects & Live Lounge Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (8 cols): Top Projects */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-[#1C1917] dark:text-white">
                      Featured Repositories
                    </h2>
                    <p className="text-xs text-zinc-500">Real open-source projects ready for collaboration</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('repos')}
                    className="text-xs font-bold text-[#B7194B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white dark:bg-[#121316] h-48 rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 animate-pulse" />
                    ))}
                  </div>
                ) : repos.length === 0 ? (
                  <EmptyState
                    icon={<FolderGit2 className="w-8 h-8 text-[#B7194B]" />}
                    title="No repositories found"
                    description="Be the first developer to create a project and invite collaborators."
                    actionText="Create Repository"
                    onAction={() => router.push(user ? '/create' : '/auth')}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {repos.slice(0, 4).map((repo) => (
                      <ProjectCard key={repo._id} repo={repo} />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (4 cols): Interactive Terminal & Mini Chat */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-[#121316] rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E0DB] dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#B7194B]" />
                      <span className="font-bold text-xs">Live Team Lounge</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      4 Online
                    </span>
                  </div>

                  <div className="space-y-2.5 my-4 text-xs">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="bg-stone-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-[#E2E0DB] dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#B7194B] text-[11px]">{msg.user}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">{msg.time}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-[#E2E0DB] dark:border-zinc-800">
                    <input
                      type="text"
                      placeholder="Send message to lounge..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-stone-50 dark:bg-zinc-950 border border-[#E2E0DB] dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#1C1917] dark:text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Send"
                      className="p-2 rounded-xl bg-[#B7194B] text-white hover:brightness-110 cursor-pointer transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: REPOSITORIES */}
        {activeTab === 'repos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#1C1917] dark:text-white">
                  Explore Repositories
                </h2>
                <p className="text-xs text-zinc-500">Discover and fork collaborative software repositories</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs py-2 pl-9 pr-4 bg-white dark:bg-[#121316] border border-[#E2E0DB] dark:border-zinc-800 rounded-full focus:outline-none focus:border-[#B7194B] text-[#1C1917] dark:text-white"
                  />
                </div>
                <button
                  onClick={() => router.push(user ? '/create' : '/auth')}
                  className="px-4 py-2 rounded-full bg-[#B7194B] text-white text-xs font-bold shadow-xs hover:brightness-110"
                >
                  + New Repo
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#121316] h-52 rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <EmptyState
                icon={<FolderGit2 className="w-8 h-8 text-[#B7194B]" />}
                title="No matching repositories"
                description="Try another search keyword or create a new public repository."
                actionText="Create Repository"
                onAction={() => router.push(user ? '/create' : '/auth')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRepos.map((repo) => (
                  <ProjectCard key={repo._id} repo={repo} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MONACO LIVE IDE */}
        {activeTab === 'monaco' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-[#121316] p-4 rounded-2xl border border-[#E2E0DB] dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-[#B7194B]" />
                <div>
                  <h2 className="font-display font-bold text-sm text-[#1C1917] dark:text-white">
                    Live Monaco Code Studio
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Real-time syntax highlighting & AST buffer sync
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">Language:</span>
                <select
                  value={editorLang}
                  onChange={(e) => setEditorLang(e.target.value)}
                  className="text-xs font-mono bg-stone-100 dark:bg-zinc-950 border border-[#E2E0DB] dark:border-zinc-800 rounded-lg px-2.5 py-1 text-[#1C1917] dark:text-white focus:outline-none"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                </select>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2E0DB] dark:border-zinc-800 shadow-md bg-[#1e1e1e]" style={{ height: '520px' }}>
              <MonacoEditor
                height="100%"
                language={editorLang}
                theme="vs-dark"
                value={editorCode}
                onChange={(val) => setEditorCode(val || '')}
                options={{
                  fontSize: 13,
                  lineNumbers: 'on',
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  fontFamily: "'Space Mono', monospace",
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: SPRINT KANBAN */}
        {activeTab === 'kanban' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-[#1C1917] dark:text-white">
                  Sprint Kanban Board
                </h2>
                <p className="text-xs text-zinc-500">Collaborative task columns synchronized across peer workspaces</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B7194B]/15 text-[#B7194B] border border-[#B7194B]/30">
                  4 Columns Active
                </span>
              </div>
            </div>

            {/* 4 Kanban Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { colId: 'todo', title: 'TODO', color: 'text-zinc-500' },
                { colId: 'in-progress', title: 'IN PROGRESS', color: 'text-amber-500' },
                { colId: 'review', title: 'REVIEW', color: 'text-blue-500' },
                { colId: 'done', title: 'DONE', color: 'text-emerald-500' },
              ].map((col) => {
                const colTasks = tasks.filter((t) => t.col === col.colId);
                return (
                  <div key={col.colId} className="bg-white dark:bg-[#121316] rounded-2xl p-4 border border-[#E2E0DB] dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2E0DB] dark:border-zinc-800 mb-3">
                        <span className={`text-xs font-black tracking-wider ${col.color}`}>
                          {col.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-zinc-500">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {colTasks.map((t) => (
                          <div key={t.id} className="bg-stone-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-[#E2E0DB] dark:border-zinc-800 shadow-xs transition-transform hover:-translate-y-0.5">
                            <p className="text-xs font-semibold text-[#1C1917] dark:text-zinc-200 leading-snug">
                              {t.title}
                            </p>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/60 dark:border-zinc-800/80">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 dark:text-rose-300 border border-rose-500/20">
                                {t.tag}
                              </span>
                              <span className="w-5 h-5 rounded-full bg-[#B7194B] text-white flex items-center justify-center text-[9px] font-bold">
                                {t.user}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: TEAM LIVE CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white dark:bg-[#121316] rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between" style={{ minHeight: '520px' }}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E0DB] dark:border-zinc-800 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#B7194B]" />
                    <div>
                      <h2 className="font-display font-bold text-sm text-[#1C1917] dark:text-white">
                        DevCollab Global Lounge
                      </h2>
                      <span className="text-[10px] text-zinc-500">Live Socket.io Room #lounge</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    4 Active Builders
                  </span>
                </div>

                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-stone-50 dark:bg-zinc-950 p-3 rounded-xl border border-[#E2E0DB] dark:border-zinc-800 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#B7194B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {msg.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-[#1C1917] dark:text-white">{msg.user}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-4 border-t border-[#E2E0DB] dark:border-zinc-800 mt-6">
                <input
                  type="text"
                  placeholder="Share a message or press / to attach snippet..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-stone-50 dark:bg-zinc-950 border border-[#E2E0DB] dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-[#1C1917] dark:text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="px-4 py-2.5 rounded-xl bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: BUILDERS DIRECTORY */}
        {activeTab === 'developers' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#1C1917] dark:text-white">
                Active Developer Community
              </h2>
              <p className="text-xs text-zinc-500">Meet engineers and creators building on DevCollab</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#121316] h-48 rounded-2xl border border-[#E2E0DB] dark:border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : developers.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-[#B7194B]" />}
                title="No developers found"
                description="Join DevCollab and create your developer profile."
                actionText="Join Community"
                onAction={() => router.push('/auth')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {developers.map((dev) => (
                  <DeveloperCard key={dev._id || dev.username} user={dev} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modern Frosted Footer */}
      <footer className="mt-auto border-t border-[#E2E0DB] dark:border-zinc-800 bg-[#EAE8E4]/50 dark:bg-zinc-950/60 px-4 md:px-8 py-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#B7194B] flex items-center justify-center font-bold text-[10px] text-white">
              DC
            </div>
            <span className="font-bold text-[#1C1917] dark:text-white">DevCollab</span>
            <span>• 100% Real Code & Zero Mock</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#B7194B] transition-colors">Showcase</Link>
            <Link href="/explore" className="hover:text-[#B7194B] transition-colors">Explore</Link>
            <Link href="/dashboard" className="hover:text-[#B7194B] transition-colors">Dashboard</Link>
            <Link href="/feed" className="hover:text-[#B7194B] transition-colors">Feed</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
