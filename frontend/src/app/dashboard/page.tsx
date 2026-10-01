"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, Plus, Star, GitFork, Activity, CheckSquare, 
  Square, ArrowUpRight, Zap, Flame, Clock, Compass, Terminal
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectCard from '@/components/cards/ProjectCard';
import EmptyState from '@/components/ui/EmptyState';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import { Squiggle, PeelBadge } from '@/components/ui/DecorativeShapes';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';

function DashboardContent() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [repos, setRepos] = useState<any[]>([]);
  const [recommendedRepos, setRecommendedRepos] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dynamic greeting based on current local hour
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (token && user) {
      loadDashboardData();
    }
  }, [token, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user repos
      const reposRes = await fetch(`${API_BASE_URL}/api/repos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          setRepos(reposData);
        }
      }

      // 2. Fetch public repos for recommendations
      const publicRes = await fetch(`${API_BASE_URL}/api/repos?type=public`);
      if (publicRes.ok) {
        const publicData = await publicRes.json();
        if (Array.isArray(publicData)) {
          const others = publicData.filter((r: any) => r.owner?._id !== user?._id);
          setRecommendedRepos(others.slice(0, 3));
        }
      }

      // 3. Fetch user activities
      if (user?.username) {
        const actRes = await fetch(`${API_BASE_URL}/api/users/${user.username}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData.activities || []);
        }
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Collect all tasks from user repos (zero fake tasks)
  const allTasks = React.useMemo(() => {
    const tasks: { repoId: string; repoName: string; task: any }[] = [];
    repos.forEach((repo) => {
      if (repo.kanban && Array.isArray(repo.kanban)) {
        repo.kanban.forEach((task: any) => {
          tasks.push({
            repoId: repo._id,
            repoName: repo.name,
            task,
          });
        });
      }
    });
    return tasks;
  }, [repos]);

  // Handle task status toggle
  const handleToggleTask = async (repoId: string, taskId: string, currentColumn: string) => {
    const targetRepo = repos.find((r) => r._id === repoId);
    if (!targetRepo || !targetRepo.kanban) return;

    const nextColumn = currentColumn === 'done' ? 'todo' : 'done';
    const updatedKanban = targetRepo.kanban.map((t: any) => {
      if (t.id === taskId) {
        return { ...t, column: nextColumn };
      }
      return t;
    });

    // Optimistic UI update
    setRepos((prev) =>
      prev.map((r) => (r._id === repoId ? { ...r, kanban: updatedKanban } : r))
    );

    try {
      await fetch(`${API_BASE_URL}/api/repos/${repoId}/kanban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ kanban: updatedKanban })
      });
    } catch (e) {
      console.error("Failed to update task status:", e);
    }
  };

  // Calculated Real Statistics
  const totalRepos = repos.length;
  const totalStars = repos.reduce((acc, r) => acc + (r.stars?.length || 0), 0);
  const totalTasks = allTasks.length;
  const totalContributions = activities.length;

  return (
    <div className="min-h-screen bg-[#F4F2EF] dark:bg-[#090909] text-[#1C1917] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        
        {/* Top Header & Greeting */}
        <div className="glass-card p-6 md:p-8 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E2E0DB] dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] rounded-3xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Active Session
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#1C1917] dark:text-white tracking-tight">
              {greeting}, <span className="text-[#B7194B]">{user?.username || 'Developer'}</span>!
            </h1>

            <p className="font-sans text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-1 font-normal">
              Let's make some great progress today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-pill-red text-xs py-2.5 px-6 flex items-center gap-2 shadow-[0_8px_20px_rgba(183,25,75,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Repository</span>
            </button>
            <Link
              href="/explore"
              className="btn-pill-glass text-xs py-2.5 px-6 font-bold flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </Link>
          </div>
        </div>

        {/* ===================================================
            REAL METRICS ROW (Zero Fabricated Data)
        =================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          
          {/* Active Projects */}
          <div className="glass-card p-5 bg-gradient-to-b from-[#FFFDF0] to-white dark:from-[#1A1811] dark:to-[#121316] border border-[#FFB800]/30 dark:border-amber-500/20 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B45309] dark:text-amber-400">
                Repositories
              </span>
              <FolderGit2 className="w-5 h-5 text-[#FFB800]" />
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white">
              {totalRepos}
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Created or collaborating</span>
          </div>

          {/* Stars Earned */}
          <div className="glass-card p-5 bg-gradient-to-b from-[#F0F7FF] to-white dark:from-[#0E1726] dark:to-[#121316] border border-blue-200/50 dark:border-blue-500/20 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Stars Earned
              </span>
              <Star className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white">
              {totalStars}
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Across all projects</span>
          </div>

          {/* Tasks Tracked */}
          <div className="glass-card p-5 bg-gradient-to-b from-[#FFF5F5] to-white dark:from-[#210D15] dark:to-[#121316] border border-[#B7194B]/30 dark:border-[#B7194B]/20 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B7194B] dark:text-rose-400">
                Kanban Tasks
              </span>
              <CheckSquare className="w-5 h-5 text-[#B7194B]" />
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white">
              {totalTasks}
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">On your boards</span>
          </div>

          {/* Contributions */}
          <div className="glass-card p-5 bg-gradient-to-b from-[#FFF8F0] to-white dark:from-[#1D160E] dark:to-[#121316] border border-amber-200/50 dark:border-amber-500/20 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Contributions
              </span>
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white">
              {totalContributions}
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tracked commits & repos</span>
          </div>

        </div>

        {/* Main Grid: Projects & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Recent Projects */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1C1917] dark:text-white">
                    Your Projects
                  </h2>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Repositories you own or participate in</p>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-pill-red text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="glass-card p-6 h-56 animate-pulse bg-white/60 dark:bg-zinc-850/60 rounded-3xl" />
                  ))}
                </div>
              ) : repos.length === 0 ? (
                <EmptyState
                  icon={<FolderGit2 className="w-8 h-8 text-[#B7194B]" />}
                  title="No recent projects"
                  description="You haven't created any repositories yet. Start your first repository to unlock the Monaco Editor, real-time collaboration, and Kanban task tracking."
                  actionText="Create Project"
                  onAction={() => setShowCreateModal(true)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {repos.map((repo) => (
                    <ProjectCard key={repo._id} repo={repo} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Projects (Real data from other community members) */}
            <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-extrabold text-xl text-[#1C1917] dark:text-white">
                  Recommended from Community
                </h3>
                <Link href="/explore" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#B7194B] dark:hover:text-[#B7194B] transition-colors">
                  View More →
                </Link>
              </div>

              {recommendedRepos.length === 0 ? (
                <p className="text-xs font-medium text-zinc-400 py-4">No recommendations yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedRepos.map((repo) => (
                    <Link
                      key={repo._id}
                      href={`/repo/${repo._id}`}
                      className="glass-card p-4 bg-white/80 dark:bg-[#121316] border border-gray-200/80 dark:border-white/10 rounded-2xl block group hover:-translate-y-1 transition-all"
                    >
                      <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
                        {repo.owner?.username}
                      </span>
                      <h4 className="font-display font-extrabold text-sm text-[#1C1917] dark:text-white group-hover:text-[#B7194B] transition-colors truncate mt-0.5">
                        {repo.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                        {repo.description || 'Public repository'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Assigned Tasks & Recent Activities */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Real Tasks Board Widget */}
            <div className="glass-card p-6 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#B7194B]" />
                  <h3 className="font-display font-extrabold text-lg text-[#1C1917] dark:text-white">Active Tasks</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-[#B7194B]/15 text-[#B7194B] dark:text-rose-400 border border-rose-100 dark:border-[#B7194B]/30">
                  {allTasks.length} total
                </span>
              </div>

              {allTasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">
                  <p className="font-display font-bold text-sm text-[#1C1917] dark:text-white">No tasks yet.</p>
                  <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">Add tasks inside any repository's Kanban board to track your progress.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allTasks.slice(0, 6).map(({ repoId, repoName, task }) => {
                    const isDone = task.column === 'done';
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                          isDone 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 opacity-60' 
                            : 'bg-white dark:bg-[#18191E] border-gray-200 dark:border-zinc-800 shadow-xs'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleTask(repoId, task.id, task.column)}
                          className="mt-0.5 cursor-pointer text-zinc-400 hover:text-[#10B981]"
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold text-[#1C1917] dark:text-white truncate ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block">
                            {repoName} • {task.column}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-6 bg-gradient-to-br from-[#EFF6FF] via-[#F5F3FF] to-[#FFF5F5] dark:from-[#131722] dark:via-[#191426] dark:to-[#220F18] border border-blue-100 dark:border-white/10 shadow-xs rounded-3xl text-[#1C1917] dark:text-zinc-100">
              <h3 className="font-display font-extrabold text-lg mb-2 text-blue-900 dark:text-blue-200">DevCollab Lounge</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-4 leading-relaxed">
                Connect live with online developers in our real-time community chat.
              </p>
              <Link
                href="/chat"
                className="btn-pill-red w-full py-2.5 text-xs font-bold text-center block shadow-[0_8px_20px_rgba(183,25,75,0.3)]"
              >
                Open Global Chat 💬
              </Link>
            </div>

          </div>

        </div>

      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => loadDashboardData()}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
