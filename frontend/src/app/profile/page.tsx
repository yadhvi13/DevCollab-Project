"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
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
    if (token) {
      fetchProfile();
      fetchRepos();
    }
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

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/repos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRepos(data);
        }
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

  const xpProgress = profile.xp % 100;

  return (
    <div className="min-h-screen bg-transparent text-[#c9d1d9] font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Identity & Gamification */}
        <div className="space-y-6">

          {/* Profile Card */}
          {/* <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent overflow-hidden">
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
           </div> */}

          {/* =========================
      Premium Profile Card
========================= */}

          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1E1B4B] via-[#111827] to-[#020617] border border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.15)]">

            {/* Background Glow */}

            <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[120px]" />

            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-violet-500/20 blur-[120px]" />

            <div className="relative p-8 flex flex-col items-center w-full">

              {isEditing ? (
                <div className="w-full space-y-4 text-left">
                  <h2 className="text-xl font-bold text-white mb-2">Edit Profile</h2>

                  <div>
                    <label className="text-xs font-semibold text-indigo-300 block mb-1">Avatar Image URL</label>
                    <Input
                      type="text"
                      value={editForm.avatar}
                      onChange={e => setEditForm({...editForm, avatar: e.target.value})}
                      className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]"
                      placeholder="Avatar image URL..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-300 block mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-300 block mb-1">Core Skills (comma-separated)</label>
                    <Input
                      type="text"
                      value={editForm.skills}
                      onChange={e => setEditForm({...editForm, skills: e.target.value})}
                      className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]"
                      placeholder="React, Next.js, TypeScript"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-300 block mb-1">Tech Stack (comma-separated)</label>
                    <Input
                      type="text"
                      value={editForm.techStack}
                      onChange={e => setEditForm({...editForm, techStack: e.target.value})}
                      className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]"
                      placeholder="Tailwind CSS, Node.js, MongoDB"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-300 block mb-1">Portfolio Links (comma-separated)</label>
                    <Input
                      type="text"
                      value={editForm.portfolioLinks}
                      onChange={e => setEditForm({...editForm, portfolioLinks: e.target.value})}
                      className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-indigo-500/50 outline-none h-[40px]"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="openToWorkProfile"
                      checked={editForm.openToWork}
                      onChange={e => setEditForm({...editForm, openToWork: e.target.checked})}
                      className="w-4 h-4 rounded bg-slate-950 border-indigo-500/30 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
                    />
                    <label htmlFor="openToWorkProfile" className="text-sm text-gray-300 cursor-pointer select-none">
                      🚀 Open to work
                    </label>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-indigo-500/20 mt-4">
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border-none cursor-pointer active:scale-95 duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-semibold text-sm border-none cursor-pointer active:scale-95 duration-200 shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Avatar */}

                  <div className="relative">

                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 blur-xl opacity-70 animate-pulse"></div>

                    <div className="relative w-36 h-36 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 p-1">

                      <div className="w-full h-full rounded-full bg-[#0F172A] overflow-hidden">

                        {profile.avatar ? (

                          <img
                            src={profile.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white">

                            {profile.username.charAt(0).toUpperCase()}

                          </div>

                        )}

                      </div>

                    </div>

                    {/* Online */}

                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-green-400 border-4 border-[#111827]" />

                  </div>

                  {/* Name */}

                  <div className="mt-6 flex items-center gap-2">

                    <h1 className="text-3xl font-extrabold text-white">

                      {profile.username}

                    </h1>

                    <CheckCircle2 className="text-sky-400 w-6 h-6" />

                  </div>

                  {/* Role */}

                  <div className="mt-3 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">

                    <p className="text-indigo-300 text-sm font-semibold tracking-wide">

                      Full Stack Developer

                    </p>

                  </div>

                  {/* Location */}

                  <div className="flex items-center gap-2 mt-4 text-gray-400">

                    <MapPin size={17} />

                    <span>

                      India

                    </span>

                  </div>

                  {/* Open To Work */}

                  {profile.openToWork && (

                    <div className="mt-4 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30">

                      <span className="text-green-400 text-sm font-semibold">

                        🚀 Open To Work

                      </span>

                    </div>

                  )}

                  {/* Bio */}

                  <p className="mt-6 text-center text-gray-300 leading-7 max-w-sm">

                    {profile.bio ||

                      "Passionate Full Stack Developer who loves building scalable applications, contributing to open source and solving real-world problems."}

                  </p>

                  {/* =========================
                  Quick Stats
            ========================= */}

                  <div className="grid grid-cols-3 gap-3 w-full mt-8">

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center hover:bg-indigo-500/10 transition-all duration-300 hover:scale-105">

                      <h3 className="text-2xl font-bold text-white">
                        {profile.level}
                      </h3>

                      <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">
                        Level
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center hover:bg-orange-500/10 transition-all duration-300 hover:scale-105">

                      <h3 className="text-2xl font-bold text-white">
                        {profile.streak}
                      </h3>

                      <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">
                        Streak
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center hover:bg-emerald-500/10 transition-all duration-300 hover:scale-105">

                      <h3 className="text-2xl font-bold text-white">
                        {profile.xp}
                      </h3>

                      <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">
                        XP
                      </p>

                    </div>

                  </div>

                  {/* =========================
                  Social Links
            ========================= */}

                  <div className="flex justify-center gap-4 mt-8">

                    {profile.portfolioLinks && profile.portfolioLinks.length > 0 ? (
                      profile.portfolioLinks.map((link: string, idx: number) => {
                        let IconComponent = ExternalLink;
                        if (link.includes('github')) IconComponent = Code;
                        if (link.includes('linkedin')) IconComponent = Briefcase;
                        return (
                          <a
                            key={idx}
                            href={link.startsWith('http') ? link : `https://${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:scale-110 transition-all duration-300"
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </a>
                        );
                      })
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          title="Click to add GitHub link"
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:scale-110 transition-all duration-300 cursor-pointer"
                        >
                          <Code className="w-5 h-5 text-white" />
                        </button>

                        <button
                          onClick={() => setIsEditing(true)}
                          title="Click to add LinkedIn link"
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-sky-500 hover:scale-110 transition-all duration-300 cursor-pointer"
                        >
                          <Briefcase className="w-5 h-5 text-white" />
                        </button>

                        <button
                          onClick={() => setIsEditing(true)}
                          title="Click to add Website link"
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-violet-500 hover:scale-110 transition-all duration-300 cursor-pointer"
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}

                  </div>

                  {/* =========================
                  Developer Highlights
            ========================= */}

                  <div className="w-full mt-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-5">

                    <div className="flex justify-between">

                      <div className="text-center">

                        <h2 className="text-xl font-bold text-white">
                          {repos.length}
                        </h2>

                        <p className="text-xs text-gray-400">
                          Repositories
                        </p>

                      </div>

                      <div className="text-center">

                        <h2 className="text-xl font-bold text-white">
                          {activities.length}
                        </h2>

                        <p className="text-xs text-gray-400">
                          Contributions
                        </p>

                      </div>

                      <div className="text-center">

                        <h2 className="text-xl font-bold text-white">
                          {repos.filter((r: any) => !r.parentRepo).length}
                        </h2>

                        <p className="text-xs text-gray-400">
                          Projects
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =========================
                  Edit Profile Button
            ========================= */}

                  <Button

                    onClick={() => setIsEditing(true)}

                    className="mt-8 w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 hover:scale-[1.03] transition-all duration-300 text-white font-semibold text-base shadow-[0_10px_40px_rgba(99,102,241,0.35)] cursor-pointer"

                  >

                    <Edit3 className="mr-2 w-5 h-5" />

                    Edit Profile

                  </Button>
                </>
              )}

            </div>

          </div>

        </div>

        {/* Right Column: Content */}
        <div className="md:col-span-2 space-y-6">

          {/* ===========================================
          Premium Developer Stats
          =========================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Level */}

          <Card className="group overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-indigo-400">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">

                    Developer Level

                  </p>

                  <h2 className="mt-2 text-4xl font-black text-white">

                    {profile.level}

                  </h2>

                </div>

                <div className="rounded-2xl bg-indigo-500/20 p-4">

                  <Shield className="h-8 w-8 text-indigo-400" />

                </div>

              </div>

              <div className="mt-6">

                <div className="mb-2 flex justify-between text-xs text-gray-400">

                  <span>XP Progress</span>

                  <span>{profile.xp % 100}/100</span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                  <div

                    style={{ width: `${xpProgress}%` }}

                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"

                  />

                </div>

              </div>

            </CardContent>

          </Card>

          {/* Streak */}

          <Card className="group overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-orange-400">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">

                    Current Streak

                  </p>

                  <h2 className="mt-2 text-4xl font-black text-white">

                    {profile.streak}

                  </h2>

                  <p className="mt-1 text-sm text-orange-300">

                    Consecutive Coding Days

                  </p>

                </div>

                <div className="rounded-2xl bg-orange-500/20 p-4">

                  <Flame className="h-8 w-8 text-orange-400" />

                </div>

              </div>

              <div className="mt-5 flex gap-1">

                {[...Array(7)].map((_, i) => (

                  <div

                    key={i}

                    className={`h-2 flex-1 rounded-full ${i < Math.min(profile.streak, 7)
                      ? "bg-orange-400"
                      : "bg-slate-700"
                      }`}

                  />

                ))}

              </div>

            </CardContent>

          </Card>

          {/* XP */}

          <Card className="group overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">

                    Total XP

                  </p>

                  <h2 className="mt-2 text-4xl font-black text-white">

                    {profile.xp.toLocaleString()}

                  </h2>

                </div>

                <div className="rounded-2xl bg-emerald-500/20 p-4">

                  <Star className="h-8 w-8 text-emerald-400" />

                </div>

              </div>

              <p className="mt-6 text-sm text-emerald-300">

                Keep contributing to earn more XP 🚀

              </p>

            </CardContent>

          </Card>

          {/* Achievement */}

          <Card className="group overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-900 to-slate-950 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-violet-400">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">

                    Achievement

                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">

                    Rising Developer

                  </h2>

                </div>

                <div className="rounded-2xl bg-violet-500/20 p-4">

                  <Award className="h-8 w-8 text-violet-400" />

                </div>

              </div>

              <p className="mt-5 text-sm text-violet-300">

                Top 15% contributor this month

              </p>

            </CardContent>

          </Card>

        </div>


          {/* ==========================================================
                Contribution Dashboard
========================================================== */}

          <div className="relative overflow-hidden rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-[#111827] to-slate-900 shadow-[0_0_60px_rgba(99,102,241,0.15)]">

            {/* Glow */}

            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />

            <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

            <div className="relative p-8">

              {/* Header */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div>

                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">

                    <Activity className="text-indigo-400" />

                    Contribution Dashboard

                  </h2>

                  <p className="mt-2 text-gray-400">

                    Track your coding journey and contribution history.

                  </p>

                </div>

                {/* Year */}

                <select

                  value={selectedYear}

                  onChange={(e) => setSelectedYear(Number(e.target.value))}

                  className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-indigo-500"

                >

                  {availableYears.map((year) => (

                    <option key={year} value={year}>

                      {year}

                    </option>

                  ))}

                </select>

              </div>

              {/* Summary Cards */}

              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5">

                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-5">

                  <p className="text-gray-400 text-xs uppercase">

                    Contributions

                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">

                    {activities.length}

                  </h2>

                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">

                  <p className="text-gray-400 text-xs uppercase">

                    Active Days

                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">

                    {new Set(
                      activities.map((a) =>
                        new Date(a.createdAt).toDateString()
                      )
                    ).size}

                  </h2>

                </div>

                <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-5">

                  <p className="text-gray-400 text-xs uppercase">

                    Current Streak

                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">

                    {profile.streak}

                  </h2>

                </div>

                <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-5">

                  <p className="text-gray-400 text-xs uppercase">

                    XP Earned

                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">

                    {profile.xp}

                  </h2>

                </div>

              </div>

              {/* Heatmap */}

              <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6">

                <ContributionGraph

                  activities={activities}

                  year={selectedYear}

                  availableYears={availableYears}

                  onYearSelect={setSelectedYear}

                />

              </div>

              {/* Timeline */}

              <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6">

                <div className="mb-6 flex items-center gap-3">

                  <Activity className="text-indigo-400" />

                  <h3 className="text-xl font-bold text-white">

                    Recent Activity

                  </h3>

                </div>

                <ActivityTimeline

                  activities={activities}

                />

              </div>

            </div>

          </div>
        


     

        {/* ==========================================
      Tech Stack & Skills
========================================== */}

        <div className="relative overflow-hidden rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-[#111827] to-[#1E1B4B] shadow-[0_0_60px_rgba(99,102,241,.12)]">

          <div className="absolute top-0 left-0 h-56 w-56 rounded-full bg-violet-500/20 blur-[120px]" />

          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative p-8">

            <div className="flex items-center justify-between mb-8">

              <div>

                <p className="uppercase tracking-[0.25em] text-xs text-indigo-400">

                  Developer Skills

                </p>

                <h2 className="text-3xl font-black text-white mt-2">

                  Tech Stack & Expertise

                </h2>

              </div>

              <Layers className="w-8 h-8 text-indigo-400" />

            </div>

            <div className="mt-10">

              <h3 className="text-lg font-bold text-white mb-6">

                ⭐ Core Skills

              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {profile.skills?.length ? (

                  profile.skills.map((skill: string, index: number) => (

                    <div

                      key={index}

                      className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-indigo-400 transition-all"

                    >

                      <div className="flex justify-between mb-3">

                        <span className="font-semibold text-white">

                          {skill}

                        </span>

                        <span className="text-indigo-400">

                          90%

                        </span>

                      </div>

                      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                        <div

                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"

                          style={{ width: "90%" }}

                        />

                      </div>

                    </div>

                  ))

                ) : (

                  <p className="text-gray-400">

                    No skills available.

                  </p>

                )}

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">

                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

                  <h3 className="font-bold text-white mb-4">

                    ⚛ Frontend

                  </h3>

                  <p className="text-gray-400 leading-8">

                    React

                    <br />

                    Next.js

                    <br />

                    Tailwind CSS

                    <br />

                    TypeScript

                  </p>

                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

                  <h3 className="font-bold text-white mb-4">

                    🛠 Backend

                  </h3>

                  <p className="text-gray-400 leading-8">

                    Node.js

                    <br />

                    Express.js

                    <br />

                    REST API

                    <br />

                    JWT

                  </p>

                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

                  <h3 className="font-bold text-white mb-4">

                    🗄 Database

                  </h3>

                  <p className="text-gray-400 leading-8">

                    MongoDB

                    <br />

                    PostgreSQL

                    <br />

                    Prisma

                  </p>

                </div>

              </div>

            </div>
            </div>


            {/* ==========================================
      Achievements & Featured Projects
========================================== */}

            <div className="relative overflow-hidden rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-[#111827] to-[#1E1B4B] shadow-[0_0_60px_rgba(99,102,241,.12)]">

              <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-violet-500/20 blur-[120px]" />

              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[120px]" />

              <div className="relative p-8">

                <div className="flex items-center justify-between mb-8">

                  <div>

                    <p className="uppercase tracking-[0.3em] text-xs text-indigo-400">

                      Developer Showcase

                    </p>

                    <h2 className="text-3xl font-black text-white mt-2">

                      Achievements & Projects

                    </h2>

                  </div>

                  <Award className="w-8 h-8 text-yellow-400" />

                </div>

                {/* Achievement Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                  <div className="rounded-3xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 p-6 hover:scale-105 transition">

                    <Award className="w-8 h-8 text-yellow-400 mb-4" />

                    <h3 className="font-bold text-white">

                      Top Contributor

                    </h3>

                    <p className="text-gray-400 text-sm mt-2">

                      Consistent coding activity.

                    </p>

                  </div>

                  <div className="rounded-3xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 p-6 hover:scale-105 transition">

                    <Star className="w-8 h-8 text-indigo-400 mb-4" />

                    <h3 className="font-bold text-white">

                      First Repository

                    </h3>

                    <p className="text-gray-400 text-sm mt-2">

                      Published your first project.

                    </p>

                  </div>

                  <div className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 p-6 hover:scale-105 transition">

                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />

                    <h3 className="font-bold text-white">

                      Bug Hunter

                    </h3>

                    <p className="text-gray-400 text-sm mt-2">

                      Successfully fixed multiple issues.

                    </p>

                  </div>

                  <div className="rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 p-6 hover:scale-105 transition">

                    <Flame className="w-8 h-8 text-orange-400 mb-4" />

                    <h3 className="font-bold text-white">

                      Coding Streak

                    </h3>

                    <p className="text-gray-400 text-sm mt-2">

                      {profile.streak} days in a row.

                    </p>

                  </div>

                </div>

                {/* Featured Projects */}

                <div className="mt-12">

                  <h3 className="text-2xl font-bold text-white mb-6">

                    🚀 Featured Projects

                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {repos.length > 0 ? (
                      repos.map((repo: any) => {
                        // Infer technologies from repository name, description or file paths
                        const techTags = [];
                        const fileExtensions = new Set(repo.files?.map((f: any) => f.path.split('.').pop()).filter(Boolean));
                        if (fileExtensions.has('tsx') || fileExtensions.has('jsx') || repo.name.toLowerCase().includes('react')) techTags.push('React');
                        if (repo.name.toLowerCase().includes('next') || repo.name.toLowerCase().includes('nextjs')) techTags.push('Next.js');
                        if (fileExtensions.has('ts') || fileExtensions.has('tsx')) techTags.push('TypeScript');
                        if (fileExtensions.has('py')) techTags.push('Python');
                        if (fileExtensions.has('java')) techTags.push('Java');
                        if (fileExtensions.has('cpp') || fileExtensions.has('c')) techTags.push('C++');
                        if (fileExtensions.has('html')) techTags.push('HTML');
                        if (fileExtensions.has('css')) techTags.push('CSS');
                        if (techTags.length === 0) techTags.push('JavaScript');

                        return (
                          <div
                            key={repo._id}
                            onClick={() => router.push(`/repo/${repo._id}`)}
                            className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="text-xl font-bold text-white truncate max-w-[200px]">
                                  {repo.name}
                                </h3>
                                {repo.isPrivate && (
                                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-semibold uppercase tracking-wider shrink-0">
                                    Private
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-400 mt-3 leading-7 text-sm line-clamp-2">
                                {repo.description || "No description provided."}
                              </p>
                            </div>

                            <div className="flex gap-2 mt-5 flex-wrap">
                              {techTags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="md:col-span-2 text-center py-12 rounded-3xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center w-full">
                        <p className="text-gray-400 font-semibold mb-2">No projects created yet</p>
                        <Button 
                          onClick={() => router.push('/')}
                          className="bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold px-5 py-2.5 rounded-full text-xs cursor-pointer border-none"
                        >
                          Create Repository
                        </Button>
                      </div>
                    )}
                  </div>

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
