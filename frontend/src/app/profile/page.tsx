"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Award, Star, Flame, Code, BookOpen, Layers, Briefcase, ExternalLink, MapPin, Edit3, CheckCircle2, ChevronRight, Activity, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ContributionGraph from '@/components/profile/ContributionGraph';
import ActivityTimeline from '@/components/profile/ActivityTimeline';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    skills: '',
    techStack: '',
    portfolioLinks: '',
    openToWork: false,
    avatar: ''
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    if (profile) {
      fetchActivities(selectedYear);
    }
  }, [profile, selectedYear]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          bio: data.bio || '',
          skills: data.skills?.join(', ') || '',
          techStack: data.techStack?.join(', ') || '',
          portfolioLinks: data.portfolioLinks?.join(', ') || '',
          openToWork: data.openToWork || false,
          avatar: data.avatar || ''
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async (year: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${profile.username}/activities?year=${year}`, {
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

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          bio: editForm.bio,
          skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          techStack: editForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
          portfolioLinks: editForm.portfolioLinks.split(',').map(s => s.trim()).filter(Boolean),
          openToWork: editForm.openToWork,
          avatar: editForm.avatar
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!profile) return <div className="min-h-screen bg-[#0b0908] flex items-center justify-center text-white">Loading Profile...</div>;

  const xpProgress = (profile.xp % 1000) / 10; 

  return (
    <div className="min-h-screen bg-transparent text-[#c9d1d9] font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Identity & Gamification */}
        <div className="space-y-6">
           {/* Profile Card */}
           <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             <div className="relative bg-[#120f0e]/60 backdrop-blur-xl rounded-[23px] p-6 flex flex-col items-center text-center border border-[#2d2623]">
                 
                 <div className="relative mb-6 mt-4">
                   <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 p-1 shadow-[0_0_15px_rgba(231,158,107,0.3)]">
                      <div className="w-full h-full rounded-full bg-[#0b0908] flex items-center justify-center overflow-hidden">
                         {profile.avatar ? (
                           <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-4xl font-black text-indigo-500">
                             {profile.username.charAt(0).toUpperCase()}
                           </span>
                         )}
                      </div>
                   </div>
                   {profile.openToWork && (
                     <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                       Open to Work
                     </div>
                   )}
                 </div>

                 <h1 className="text-2xl font-bold text-white mb-1">{profile.username}</h1>
                 <p className="text-[#8b949e] text-sm flex items-center gap-1 mb-6">
                    <MapPin className="w-3.5 h-3.5" /> Planet Earth
                 </p>

                 {isEditing ? (
                   <div className="w-full space-y-3 text-left">
                     <Input type="text" value={editForm.avatar} onChange={e => setEditForm({...editForm, avatar: e.target.value})} className="w-full bg-[#0b0908] border border-[#2d2623] rounded-xl p-2.5 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]" placeholder="Avatar Image URL (optional)..." />
                     <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-[#0b0908] border border-[#2d2623] rounded-xl p-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none" rows={3} placeholder="Bio..." />
                     <label className="flex items-center gap-2 text-sm cursor-pointer">
                       <input type="checkbox" checked={editForm.openToWork} onChange={e => setEditForm({...editForm, openToWork: e.target.checked})} className="rounded bg-black border-white/10 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer" />
                       Open to work
                     </label>
                     <Button onClick={handleSave} className="w-full bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold py-6 rounded-full transition-all shadow-[0_0_20px_rgba(231,158,107,0.3)] cursor-pointer border-none active:scale-95 duration-200">Save Changes</Button>
                   </div>
                 ) : (
                   <>
                     <p className="text-sm text-[#c9d1d9] leading-relaxed mb-6">"{profile.bio || 'No bio written yet.'}"</p>
                     <Button onClick={() => setIsEditing(true)} className="w-full bg-[#120f0e] hover:bg-[#1e1917] text-[#c9d1d9] border border-[#2d2623] font-semibold py-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 duration-200">
                       <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Profile
                     </Button>
                   </>
                 )}
              </div>
           </div>

           {/* Gamification Stats */}
           <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-2xl border-none p-[1px] bg-gradient-to-br from-indigo-500/20 to-transparent">
                 <CardContent className="bg-[#120f0e]/80 backdrop-blur-xl rounded-[15px] p-4 flex flex-col gap-2 border border-[#2d2623]">
                    <div className="flex items-center gap-2 text-indigo-500">
                       <Shield className="w-5 h-5 text-indigo-500" />
                       <span className="text-xs font-bold uppercase tracking-wider">Level {profile.level}</span>
                    </div>
                    <div className="text-2xl font-black text-white">{profile.xp.toLocaleString()} <span className="text-xs font-medium text-[#8b949e]">XP</span></div>
                    <div className="w-full h-1.5 bg-[#0b0908] rounded-full overflow-hidden mt-1">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-2xl border-none p-[1px] bg-gradient-to-br from-orange-500/20 to-transparent">
                 <CardContent className="bg-[#120f0e]/80 backdrop-blur-xl rounded-[15px] p-4 flex flex-col gap-2 border border-[#2d2623]">
                    <div className="flex items-center gap-2 text-orange-400">
                       <Flame className="w-5 h-5" />
                       <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="text-2xl font-black text-white">{profile.streak} <span className="text-xs font-medium text-[#8b949e]">Days</span></div>
                    <p className="text-[10px] text-[#8b949e] mt-1">Code every day to keep it alive!</p>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Right Column: Content */}
        <div className="md:col-span-2 space-y-6">

           {/* Contribution Activity Section */}
           <div className="rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/10 to-transparent">
             <div className="bg-[#120f0e]/80 backdrop-blur-xl rounded-[23px] p-8 border border-[#2d2623] shadow-lg">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Contribution Activity
                </h2>
                
                <ContributionGraph 
                  activities={activities}
                  year={selectedYear}
                  availableYears={availableYears}
                  onYearSelect={setSelectedYear}
                />

                <ActivityTimeline activities={activities} />
             </div>
           </div>
           
            {/* Tech Stack & Skills */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/10 to-transparent">
              <div className="bg-[#120f0e]/60 backdrop-blur-xl rounded-[23px] p-8 border border-[#2d2623] shadow-lg">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <Layers className="w-5 h-5 text-indigo-500" /> Tech Stack & Skills
                   </h2>
                 </div>

                 {isEditing ? (
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Tech Stack (comma separated)</label>
                        <Input type="text" value={editForm.techStack} onChange={e => setEditForm({...editForm, techStack: e.target.value})} className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl p-2.5 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Core Skills (comma separated)</label>
                        <Input type="text" value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} className="w-full bg-[#0b0908]/60 border border-[#2d2623] rounded-xl p-2.5 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]" />
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     <div>
                        <h3 className="text-sm font-semibold text-[#8b949e] mb-3">Technologies</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.techStack && profile.techStack.length > 0 ? profile.techStack.map((tech: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-500/20 transition-colors cursor-default">
                              {tech}
                            </span>
                          )) : <span className="text-sm text-[#8b949e] italic">No technologies added yet.</span>}
                        </div>
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold text-[#8b949e] mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-[#120f0e] border border-[#2d2623] text-[#c9d1d9] rounded-lg text-sm font-medium hover:bg-[#1e1917] transition-colors cursor-default flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {skill}
                            </span>
                          )) : <span className="text-sm text-[#8b949e] italic">No skills added yet.</span>}
                        </div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
 
            {/* Achievements & Badges */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/10 to-transparent">
              <div className="bg-[#120f0e]/60 backdrop-blur-xl rounded-[23px] p-8 border border-[#2d2623] shadow-lg">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                   <Award className="w-5 h-5 text-indigo-500" /> Achievements & Badges
                 </h2>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#0b0908] border border-[#2d2623] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-indigo-500/30 transition-colors group cursor-default">
                       <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Star className="w-6 h-6 text-indigo-500" />
                       </div>
                       <span className="text-sm font-bold text-white">First Commit</span>
                    </div>
                    <div className="bg-[#0b0908] border border-[#2d2623] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/30 transition-colors group cursor-default">
                       <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                       </div>
                       <span className="text-sm font-bold text-white">Bug Squasher</span>
                    </div>
                    <div className="bg-[#0b0908] border border-[#2d2623] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                       <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                         <Activity className="w-6 h-6 text-[#8b949e]" />
                       </div>
                       <span className="text-sm font-bold text-white">7 Day Streak</span>
                    </div>
                    <div className="bg-[#0b0908] border border-[#2d2623] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                       <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                         <Code className="w-6 h-6 text-[#8b949e]" />
                       </div>
                       <span className="text-sm font-bold text-white">100k Lines</span>
                    </div>
                 </div>
              </div>
            </div>

        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
