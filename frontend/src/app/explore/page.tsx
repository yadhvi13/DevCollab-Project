"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Compass, Star, GitFork, Book } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function Explore() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchRepos();
    }
  }, [token]);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos?type=public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
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
    <div className="min-h-screen bg-transparent text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-b border-[#2d2623] pb-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_12px_rgba(231,158,107,0.3)]">
             <Compass className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Explore</h1>
            <p className="text-[#8b949e] mt-1 text-sm">
              Discover repositories, projects, and developers across DevCollab.
            </p>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-12 text-[#8b949e]">Loading repositories...</div>
        ) : repos.length === 0 ? (
           <div className="text-center py-20 border border-[#2d2623] rounded-2xl bg-[#120f0e]/50 backdrop-blur-sm">
             <Compass className="w-12 h-12 text-[#2d2623] mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">No public repositories found</h3>
             <p className="text-[#8b949e] text-sm">Check back later as the community grows!</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {repos.map(repo => (
               <Card key={repo._id} className="border-[#2d2623] bg-[#120f0e]/50 backdrop-blur-sm text-[#c9d1d9] rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,158,107,0.15)] flex flex-col">
                 <div className="flex items-start gap-3 mb-3">
                   <Book className="w-5 h-5 text-indigo-500 mt-0.5" />
                   <div>
                     <h3 className="text-lg font-bold text-white cursor-pointer hover:text-indigo-500 hover:underline transition-colors" onClick={() => router.push(`/repo/${repo._id}`)}>
                       {repo.owner.username} / <span className="font-extrabold text-indigo-500">{repo.name}</span>
                     </h3>
                     <p className="text-xs text-[#8b949e] mt-1">Updated {new Date(repo.updatedAt || Date.now()).toLocaleDateString()}</p>
                   </div>
                 </div>
                 
                 <p className="text-sm text-[#c9d1d9] mb-6 flex-1 leading-relaxed">
                   {repo.description || 'No description provided.'}
                 </p>
                 
                 <div className="flex items-center gap-4 text-xs text-[#8b949e] mt-auto">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> JavaScript
                    </div>
                    <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-pointer">
                      <Star className="w-4 h-4" /> {repo.stars?.length || 0}
                    </div>
                    <div className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-pointer">
                      <GitFork className="w-4 h-4" /> {repo.forksCount || 0}
                    </div>
                 </div>
               </Card>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <Explore />
    </ProtectedRoute>
  );
}
