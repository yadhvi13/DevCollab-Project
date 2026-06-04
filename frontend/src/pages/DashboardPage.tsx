import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FolderGit2, Star, GitFork, Activity, Plus, Search, Bell, GitPullRequest, CircleDot, Store, MessageSquare, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AIChatbot from '../components/AIChatbot';
import ContributionGraph from '../components/profile/ContributionGraph';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
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
    fetchRepos();
  }, []);

  useEffect(() => {
    if (user) {
      fetchActivities(selectedYear);
    }
  }, [user, selectedYear]);

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

  const fetchActivities = async (year: number) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.username}/activities?year=${year}`, {
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
        fetchActivities(selectedYear); // refresh activities
        const data = await res.json();
        navigate(`/repo/${data._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-white">Top Repositories</h2>
              <button 
                onClick={() => setShowNewRepoModal(true)}
                className="bg-[#238636] hover:bg-[#2ea043] active:scale-95 active:bg-[#2ea043] text-white text-xs font-medium py-1 px-3 rounded-md flex items-center gap-1 transition-all duration-200"
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
                  className="w-full text-left flex items-center gap-2 group text-sm p-1.5 -mx-1.5 rounded-md hover:bg-[#21262d] active:bg-[#21262d] active:scale-[0.98] transition-all duration-200"
                >
                  <FolderGit2 className="w-4 h-4 text-[#8b949e] group-hover:text-white group-active:text-white transition-colors" />
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-[#8b949e] group-hover:text-white group-active:text-white transition-colors truncate">{user?.username}</span>
                    <span className="text-[#8b949e]">/</span>
                    <span className="font-semibold text-white group-hover:text-indigo-400 group-active:text-indigo-400 transition-colors truncate">{repo.name}</span>
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
              {activities.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                  <div className="bg-[#21262d] p-1 rounded-full">
                    {activities[0].type === 'CREATE_REPO' ? <FolderGit2 className="w-3.5 h-3.5" /> : <GitFork className="w-3.5 h-3.5" />}
                  </div>
                  <span>
                    {activities[0].type === 'CREATE_REPO' ? 'You created ' : 'You committed to '} 
                    <span className="font-semibold text-[#c9d1d9]">{activities[0].repoName}</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#8b949e]">No recent activity yet.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Contribution Graph */}
          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-5 overflow-hidden">
             <ContributionGraph 
               activities={activities}
               year={selectedYear}
               availableYears={availableYears}
               onYearSelect={setSelectedYear}
             />
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
                <p className="text-xs text-[#8b949e]">You haven't forked any repositories yet.</p>
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
                <button className="text-xs text-[#58a6ff] hover:underline active:text-indigo-400 transition-colors">View all activity</button>
             </div>
             
             <div className="border-t border-[#30363d] pt-4 space-y-4">
                {activities.length > 0 ? activities.slice(0, 5).map(act => (
                  <div key={act._id} className="flex gap-4">
                    <div className="bg-[#21262d] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      {act.type === 'CREATE_REPO' ? <FolderGit2 className="w-5 h-5 text-[#8b949e]" /> : <GitFork className="w-5 h-5 text-[#8b949e]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <p className="text-sm">
                           <span className="font-bold text-white">{user?.username}</span> {act.type === 'CREATE_REPO' ? 'created a repository' : 'pushed a commit to'} <span className="font-semibold text-[#58a6ff]">{act.repoName}</span>
                         </p>
                         <span className="text-xs text-[#8b949e]">{new Date(act.timestamp).toLocaleDateString()}</span>
                      </div>
                      {act.type === 'COMMIT' && act.metadata?.commitSha && (
                        <p className="text-xs text-[#8b949e] italic mt-1">Commit {act.metadata.commitSha.substring(0, 7)}</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[#8b949e]">No recent activity to display.</p>
                )}
             </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Explore Repositories</h2>
            
            <div className="space-y-4">
              <div>
                <a href="#" className="text-sm font-bold text-[#58a6ff] hover:underline active:text-indigo-400 transition-colors block">facebook / react</a>
                <p className="text-xs text-[#8b949e] mt-1">A JavaScript library for building user interfaces</p>
              </div>
              <div className="border-t border-[#30363d] pt-4">
                <a href="#" className="text-sm font-bold text-[#58a6ff] hover:underline active:text-indigo-400 transition-colors block">tailwindlabs / tailwindcss</a>
                <p className="text-xs text-[#8b949e] mt-1">A utility-first CSS framework for rapid UI development.</p>
              </div>
            </div>
            
            <button className="w-full text-center text-xs text-[#58a6ff] hover:underline mt-4 pt-4 border-t border-[#30363d]">
              Explore more repositories
            </button>
          </div>

          <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Your Teams</h2>
            <div className="flex items-center gap-2 cursor-pointer group active:scale-[0.98] transition-all duration-200">
               <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.8)] group-active:shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all">DC</div>
               <span className="text-sm font-medium text-white group-hover:text-indigo-400 group-active:text-indigo-400 transition-colors">DevCollab Core</span>
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
      <AIChatbot fileContext="Dashboard View: General questions about the platform." />

    </div>
  );
}
