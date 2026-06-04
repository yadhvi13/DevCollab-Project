import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Compass, Star, GitFork, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/repos?type=public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter to only show public repos, or repos not owned by the user to make it "Explore"
        const exploreRepos = data.filter((r: any) => !r.isPrivate && r.owner._id !== user?._id);
        setRepos(exploreRepos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-b border-[#30363d] pb-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
             <Compass className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Explore</h1>
            <p className="text-[#8b949e] mt-1">
              Discover repositories, projects, and developers across DevCollab.
            </p>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-12 text-[#8b949e]">Loading repositories...</div>
        ) : repos.length === 0 ? (
           <div className="text-center py-20 border border-[#30363d] rounded-xl bg-[#161b22]/50">
             <Compass className="w-12 h-12 text-[#30363d] mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-white mb-2">No public repositories found</h3>
             <p className="text-[#8b949e]">Check back later as the community grows!</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {repos.map(repo => (
               <div key={repo._id} className="border border-[#30363d] bg-[#161b22] rounded-xl p-6 hover:border-[#8b949e] transition-colors flex flex-col">
                 <div className="flex items-start gap-3 mb-3">
                   <Book className="w-5 h-5 text-[#8b949e] mt-0.5" />
                   <div>
                     <h3 className="text-lg font-semibold text-[#58a6ff] cursor-pointer hover:underline" onClick={() => navigate(`/repo/${repo._id}`)}>
                       {repo.owner.username} / <span className="font-bold">{repo.name}</span>
                     </h3>
                     <p className="text-xs text-[#8b949e] mt-1">Updated {new Date(repo.updatedAt || Date.now()).toLocaleDateString()}</p>
                   </div>
                 </div>
                 
                 <p className="text-sm text-[#c9d1d9] mb-6 flex-1">
                   {repo.description || 'No description provided.'}
                 </p>
                 
                 <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div> JavaScript
                    </div>
                    <div className="flex items-center gap-1 hover:text-[#58a6ff] cursor-pointer">
                      <Star className="w-4 h-4" /> {repo.stars?.length || 0}
                    </div>
                    <div className="flex items-center gap-1 hover:text-[#58a6ff] cursor-pointer">
                      <GitFork className="w-4 h-4" /> {repo.forksCount || 0}
                    </div>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
