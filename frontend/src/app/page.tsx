"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FolderGit2, Star, GitFork, Activity, Plus, Search, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AIChatbot from '@/components/AIChatbot';
import ContributionGraph from '@/components/profile/ContributionGraph';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [repos, setRepos] = useState<any[]>([]);
  const [showNewRepoModal, setShowNewRepoModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [initReadme, setInitReadme] = useState(true);

  const [activities, setActivities] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (token) {
      fetchRepos();
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchActivities(selectedYear);
    }
  }, [user, selectedYear, token]);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRepos(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async (year: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.username}/activities?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities);
        setAvailableYears(data.availableYears);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newRepoName, description: newRepoDesc, isPrivate, initReadme })
      });
      if (res.ok) {
        setShowNewRepoModal(false);
        fetchRepos();
        fetchActivities(selectedYear); // refresh activities
        const data = await res.json();
        router.push(`/repo/${data._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-foreground">Top Repositories</h2>
              <Button 
                onClick={() => setShowNewRepoModal(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-1 px-3 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer border-none shadow-[0_0_10px_var(--shadow-color)]"
              >
                <FolderGit2 className="w-3.5 h-3.5" /> New
              </Button>
            </div>
            
            <Input 
              type="text" 
              placeholder="Find a repository..." 
              className="w-full bg-card/60 border border-border rounded-md py-1.5 px-3 text-sm text-foreground focus-visible:ring-primary/50 mb-4 h-[38px]"
            />
            
            <div className="space-y-2">
              {repos.map(repo => (
                <button 
                  key={repo._id} 
                  onClick={() => router.push(`/repo/${repo._id}`)}
                  className="w-full text-left flex items-center gap-2 group text-sm p-1.5 -mx-1.5 rounded-md hover:bg-muted active:bg-muted active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-active:text-foreground transition-colors" />
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-muted-foreground group-hover:text-foreground group-active:text-foreground transition-colors truncate">{user?.username}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-foreground group-hover:text-primary group-active:text-primary transition-colors truncate">{repo.name}</span>
                  </div>
                </button>
              ))}
              {repos.length === 0 && (
                <p className="text-sm text-muted-foreground">No repositories yet.</p>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {activities.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="bg-muted p-1 rounded-full">
                    {activities[0].type === 'CREATE_REPO' ? <FolderGit2 className="w-3.5 h-3.5 text-primary" /> : <GitFork className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span>
                    {activities[0].type === 'CREATE_REPO' ? 'You created ' : 'You committed to '} 
                    <span className="font-semibold text-foreground">{activities[0].repoName}</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No recent activity yet.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Contribution Graph */}
          <div className="border border-border bg-card/50 backdrop-blur-sm rounded-xl p-5 overflow-hidden">
             <ContributionGraph 
               activities={activities}
               year={selectedYear}
               availableYears={availableYears}
               onYearSelect={setSelectedYear}
             />
          </div>

          {/* Welcome Dashboard Hero */}
          <Card className="relative border-border bg-card/40 backdrop-blur-md text-foreground rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden group">
            {/* Soft background glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
              
              {/* Left Content Side */}
              <div className="flex-1 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary font-bold mb-4 tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  AI-Powered Developer Studio
                </div>

                <h1 className="font-space-mono text-2xl md:text-4xl font-bold text-foreground leading-[1.2] mb-4 tracking-wide uppercase">
                  Your coding <br />
                  <span className="text-primary">questions</span> <br />
                  answered <br />
                  instantly
                </h1>

                <p className="text-muted-foreground max-w-lg text-xs md:text-sm leading-relaxed mb-6">
                  Collaborate with our real-time AI assistant for instant codebase analysis, manage project tasks on the Kanban board, and deploy. Available 24/7.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chatbot'))} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_var(--shadow-color)] transition-all duration-200 cursor-pointer border-none active:scale-95 text-xs h-[36px]"
                  >
                    <Bot className="w-4 h-4 text-primary-foreground" /> Try AI assistant
                  </Button>
                  <Button 
                    onClick={() => setShowNewRepoModal(true)} 
                    className="bg-card border border-border hover:bg-muted text-foreground font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 text-xs h-[36px]"
                  >
                    <Plus className="w-4 h-4 text-primary" /> Create repository
                  </Button>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border w-full max-w-md">
                  <div className="flex -space-x-2.5">
                    <img className="w-7 h-7 rounded-full border border-background object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Developer" />
                    <img className="w-7 h-7 rounded-full border border-background object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Developer" />
                    <img className="w-7 h-7 rounded-full border border-background object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Developer" />
                    <img className="w-7 h-7 rounded-full border border-background object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Developer" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-[10px]">★★★★★</span>
                      <span className="text-[11px] font-extrabold text-foreground ml-0.5">4.9/5</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Trusted by 1,200+ active developers</span>
                  </div>
                </div>
              </div>

              {/* Right Illustration Side */}
              <div className="hidden lg:flex items-center justify-center relative flex-1 min-w-[280px]">
                <div className="absolute w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
                <img 
                  src="/ai_robot_assistant.png" 
                  alt="AI Coding Assistant" 
                  className="w-[260px] h-[260px] rounded-full border border-border bg-card/50 object-contain p-4 drop-shadow-[0_0_30px_var(--shadow-color)] hover:scale-105 transition-transform duration-500" 
                />
              </div>

            </div>
          </Card>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border bg-card/50 backdrop-blur-sm rounded-2xl p-4 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
                <Star className="w-4 h-4 text-primary" /> Starred
              </h3>
              <p className="text-xs text-muted-foreground">You haven't starred any repositories yet.</p>
            </div>
            <div className="border border-border bg-card/50 backdrop-blur-sm rounded-2xl p-4 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
                <GitFork className="w-4 h-4 text-primary" /> Forks
              </h3>
              <p className="text-xs text-muted-foreground">You haven't forked any repositories yet.</p>
            </div>
            <div className="border border-border bg-card/50 backdrop-blur-sm rounded-2xl p-4 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
                <Activity className="w-4 h-4 text-primary" /> Alerts
              </h3>
              <p className="text-xs text-muted-foreground">Everything looks good! No active alerts.</p>
            </div>
          </div>
          
          <div className="mt-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-foreground">Recent Activity Feed</h2>
                <button className="text-xs text-primary hover:underline active:text-primary/80 transition-colors cursor-pointer">View all activity</button>
             </div>
             
             <div className="border-t border-border pt-4 space-y-4">
                {activities.length > 0 ? activities.slice(0, 5).map(act => (
                  <div key={act._id} className="flex gap-4">
                    <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border">
                      {act.type === 'CREATE_REPO' ? <FolderGit2 className="w-5 h-5 text-muted-foreground" /> : <GitFork className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <p className="text-sm">
                           <span className="font-bold text-foreground">{user?.username}</span> {act.type === 'CREATE_REPO' ? 'created a repository' : 'pushed a commit to'} <span className="font-semibold text-primary">{act.repoName}</span>
                         </p>
                         <span className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleDateString()}</span>
                      </div>
                      {act.type === 'COMMIT' && act.metadata?.commitSha && (
                        <p className="text-xs text-muted-foreground italic mt-1">Commit {act.metadata.commitSha.substring(0, 7)}</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No recent activity to display.</p>
                )}
             </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm text-foreground rounded-xl p-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Explore Repositories</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <a href="#" className="text-sm font-bold text-primary hover:underline active:text-primary/80 transition-colors block">facebook / react</a>
                <p className="text-xs text-muted-foreground mt-1">A JavaScript library for building user interfaces</p>
              </div>
              <div className="border-t border-border pt-4">
                <a href="#" className="text-sm font-bold text-primary hover:underline active:text-primary/80 transition-colors block">tailwindlabs / tailwindcss</a>
                <p className="text-xs text-muted-foreground mt-1">A utility-first CSS framework for rapid UI development.</p>
              </div>
              <button className="w-full text-center text-xs text-primary hover:underline mt-4 pt-4 border-t border-border cursor-pointer">
                Explore more repositories
              </button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm text-foreground rounded-xl p-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Your Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 cursor-pointer group active:scale-[0.98] transition-all duration-200">
                 <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_var(--shadow-color)] group-hover:shadow-[0_0_15px_var(--shadow-color)] group-active:shadow-[0_0_15px_var(--shadow-color)] transition-all">DC</div>
                 <span className="text-sm font-medium text-foreground group-hover:text-primary group-active:text-primary transition-colors">DevCollab Core</span>
              </div>
            </CardContent>
          </Card>
        </aside>

      </main>

      {/* New Repo Modal */}
      {showNewRepoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4 text-foreground">Create a new repository</h2>
            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Repository Name</label>
                <Input 
                  type="text" 
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl text-sm text-foreground focus-visible:ring-primary/50 h-[38px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <Input 
                  type="text" 
                  value={newRepoDesc}
                  onChange={e => setNewRepoDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl text-sm text-foreground focus-visible:ring-primary/50 h-[38px]"
                />
              </div>
              
              <div className="flex items-center gap-4 py-2 border-b border-border pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    checked={!isPrivate} 
                    onChange={() => setIsPrivate(false)}
                    className="accent-primary cursor-pointer"
                  />
                  <span className="text-sm">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    checked={isPrivate} 
                    onChange={() => setIsPrivate(true)}
                    className="accent-primary cursor-pointer"
                  />
                  <span className="text-sm">Private</span>
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground pt-2">
                <input 
                  type="checkbox"
                  checked={initReadme}
                  onChange={e => setInitReadme(e.target.checked)}
                  className="accent-primary rounded cursor-pointer"
                />
                Initialize repository with a README
              </label>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <Button type="button" onClick={() => setShowNewRepoModal(false)} variant="secondary" className="cursor-pointer rounded-full px-5">Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-none cursor-pointer rounded-full px-5 shadow-[0_0_10px_var(--shadow-color)]">Create Repository</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Chat Button */}
      <AIChatbot fileContext="Dashboard View: General questions about the platform." />

    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
