import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FolderGit2, Star, GitFork, Activity, Plus, Search, Bell, GitPullRequest, CircleDot, Store, MessageSquare, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<any[]>([]);
  const [showNewRepoModal, setShowNewRepoModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [initReadme, setInitReadme] = useState(true);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRepos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/repos', {
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
        const data = await res.json();
        navigate(`/repo/${data._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Generate mock contribution data
  const generateContributions = () => {
    const weeks = 52;
    const days = 7;
    const grid = [];
    for (let i = 0; i < weeks; i++) {
      const week = [];
      for (let j = 0; j < days; j++) {
        // Mostly 0, some random higher values for the screenshot look
        const intensity = Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0;
        week.push(intensity);
      }
      grid.push(week);
    }
    return grid;
  };

  const contributionGrid = generateContributions();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* GitHub-style Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-white p-1 rounded-md">
              <FolderGit2 className="w-6 h-6 text-black" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">DEVCOLLAB</span>
          </div>
          
          <div className="relative w-64 ml-4 hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
            <input 
              type="text" 
              placeholder="Quick search... (cmd + k)"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-9 pr-3 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>

          <nav className="hidden md:flex items-center gap-4 text-sm font-semibold ml-2">
            <a href="#" className="hover:text-white transition-colors">Pull requests</a>
            <a href="#" className="hover:text-white transition-colors">Issues</a>
            <a href="#" className="hover:text-white transition-colors">Marketplace</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-[#8b949e] hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#161b22]"></span>
          </button>
          
          <button className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1">
            <Plus className="w-5 h-5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <button className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-[#30363d] hover:border-zinc-400 transition-all cursor-pointer" onClick={logout} title="Sign out">
            {user?.username.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-white">Top Repositories</h2>
              <button 
                onClick={() => setShowNewRepoModal(true)}
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium py-1 px-3 rounded-md flex items-center gap-1 transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5" /> New
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Find a repository..." 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-3 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] mb-4"
            />
            
            <div className="space-y-2">
              {repos.map(repo => (
                <button 
                  key={repo._id} 
                  onClick={() => navigate(`/repo/${repo._id}`)}
                  className="w-full text-left flex items-center gap-2 group text-sm"
                >
                  <FolderGit2 className="w-4 h-4 text-[#8b949e] group-hover:text-white transition-colors" />
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-[#8b949e] group-hover:text-white transition-colors truncate">{user?.username}</span>
                    <span className="text-[#8b949e]">/</span>
                    <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">{repo.name}</span>
                  </div>
                </button>
              ))}
              {repos.length === 0 && (
                <p className="text-sm text-[#8b949e]">No repositories yet.</p>
              )}
            </div>
          </div>

          <div className="border-t border-[#30363d] pt-4">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <div className="bg-[#21262d] p-1 rounded-full"><GitFork className="w-3.5 h-3.5" /></div>
                <span>You forked <span className="font-semibold text-[#c9d1d9]">DSA placement</span></span>
              </div>
            </div>
          </div>
        </aside>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Contribution Graph */}
          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-white">Contribution Activity</h2>
              <span className="text-xs text-[#8b949e]">Last 12 months</span>
            </div>
            
            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                {contributionGrid.map((week, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {week.map((day, j) => (
                      <div 
                        key={`${i}-${j}`} 
                        className={`w-[11px] h-[11px] rounded-[2px] ${
                          day === 0 ? 'bg-[#161b22]' : 
                          day === 1 ? 'bg-[#0e4429]' : 
                          day === 2 ? 'bg-[#006d32]' : 
                          day === 3 ? 'bg-[#26a641]' : 
                          'bg-[#39d353]'
                        }`}
                        title={`${day} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end items-center gap-2 mt-2 text-xs text-[#8b949e]">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#161b22]"></div>
                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#0e4429]"></div>
                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#006d32]"></div>
                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#26a641]"></div>
                <div className="w-[11px] h-[11px] rounded-[2px] bg-[#39d353]"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Welcome Dashboard */}
          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Welcome to DevCollab!</h1>
            <p className="text-[#8b949e] mb-6 max-w-2xl text-sm leading-relaxed">
              This is your personalized dashboard. You can manage your repositories, track your tasks on the Kanban board, and collaborate with your team in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-[#30363d] bg-[#161b22]/50 rounded-lg p-4">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                  <Star className="w-4 h-4 text-[#e3b341]" /> Starred
                </h3>
                <p className="text-xs text-[#8b949e]">You haven't starred any repositories yet.</p>
              </div>
              <div className="border border-[#30363d] bg-[#161b22]/50 rounded-lg p-4">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                  <GitFork className="w-4 h-4 text-[#8a8cf7]" /> Forks
                </h3>
                <p className="text-xs text-white">yogeeta / DSA placement</p>
              </div>
              <div className="border border-[#30363d] bg-[#161b22]/50 rounded-lg p-4">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                  <Activity className="w-4 h-4 text-[#3fb950]" /> Alerts
                </h3>
                <p className="text-xs text-[#8b949e]">Everything looks good! No active alerts.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Activity Feed</h2>
                <button className="text-xs text-[#58a6ff] hover:underline">View all activity</button>
             </div>
             
             <div className="border-t border-[#30363d] pt-4">
                <div className="flex gap-4">
                  <div className="bg-[#21262d] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5 text-[#8b949e]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <p className="text-sm">
                         <span className="font-bold text-white">{user?.username}</span> created a repository <span className="font-semibold text-[#58a6ff]">DSA placement</span>
                       </p>
                       <span className="text-xs text-[#8b949e]">4/16/2026</span>
                    </div>
                    <p className="text-xs text-[#8b949e] italic mt-1">"Initial commit"</p>
                  </div>
                </div>
             </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Explore Repositories</h2>
            
            <div className="space-y-4">
              <div>
                <a href="#" className="text-sm font-bold text-[#58a6ff] hover:underline block">facebook / react</a>
                <p className="text-xs text-[#8b949e] mt-1">A JavaScript library for building user interfaces</p>
              </div>
              <div className="border-t border-[#30363d] pt-4">
                <a href="#" className="text-sm font-bold text-[#58a6ff] hover:underline block">tailwindlabs / tailwindcss</a>
                <p className="text-xs text-[#8b949e] mt-1">A utility-first CSS framework for rapid UI development.</p>
              </div>
            </div>
            
            <button className="w-full text-center text-xs text-[#58a6ff] hover:underline mt-4 pt-4 border-t border-[#30363d]">
              Explore more repositories
            </button>
          </div>

          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Your Teams</h2>
            <div className="flex items-center gap-2 cursor-pointer group">
               <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">DC</div>
               <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">DevCollab Core</span>
            </div>
          </div>
        </aside>

      </main>

      {/* New Repo Modal */}
      {showNewRepoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4 text-white">Create a new repository</h2>
            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1">Repository Name</label>
                <input 
                  type="text" 
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-3 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1">Description</label>
                <input 
                  type="text" 
                  value={newRepoDesc}
                  onChange={e => setNewRepoDesc(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-3 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>
              
              <div className="flex items-center gap-4 py-2 border-b border-[#30363d] pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    checked={!isPrivate} 
                    onChange={() => setIsPrivate(false)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    checked={isPrivate} 
                    onChange={() => setIsPrivate(true)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm">Private</span>
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#c9d1d9] pt-2">
                <input 
                  type="checkbox"
                  checked={initReadme}
                  onChange={e => setInitReadme(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                Initialize repository with a README
              </label>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#30363d]">
                <button type="button" onClick={() => setShowNewRepoModal(false)} className="px-4 py-1.5 rounded-md text-sm font-medium bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-md text-sm font-medium bg-[#238636] text-white border border-[#238636] hover:bg-[#2ea043] transition-colors">Create Repository</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#6366f1] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4f46e5] transition-colors z-50">
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

    </div>
  );
}
