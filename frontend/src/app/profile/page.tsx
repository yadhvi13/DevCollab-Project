"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Award, Star, Flame, Code, BookOpen, Layers, Briefcase, 
  ExternalLink, MapPin, Edit3, CheckCircle2, Zap, FolderGit2,
  Calendar, Check, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ContributionGraph from '@/components/profile/ContributionGraph';
import ActivityTimeline from '@/components/profile/ActivityTimeline';
import ProjectCard from '@/components/cards/ProjectCard';
import EmptyState from '@/components/ui/EmptyState';
import { PeelBadge, Squiggle } from '@/components/ui/DecorativeShapes';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const targetUsername = searchParams.get('u');
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    bio: '',
    skills: '',
    techStack: '',
    portfolioLinks: '',
    openToWork: false,
    avatar: ''
  });

  const isSelf = !targetUsername || targetUsername === user?.username;

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchRepos();
    }
  }, [token, targetUsername]);

  useEffect(() => {
    if (profile?.username) {
      fetchActivities(selectedYear);
    }
  }, [profile, selectedYear]);

  const fetchProfile = async () => {
    try {
      const endpoint = isSelf
        ? `${API_BASE_URL}/api/users/me`
        : `${API_BASE_URL}/api/users/${targetUsername}`;

      const res = await fetch(endpoint, {
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
        setActivities(data.activities || []);
        setAvailableYears(data.availableYears || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio: editForm.bio,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        techStack: editForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
        portfolioLinks: editForm.portfolioLinks.split(',').map(s => s.trim()).filter(Boolean),
        openToWork: editForm.openToWork,
        avatar: editForm.avatar
      };

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#EA384C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const allSkills = Array.from(new Set([...(profile.skills || []), ...(profile.techStack || [])]));

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 flex-1">
        
        {/* Profile Top Hero Card */}
        <div className="glass-card p-6 md:p-8 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_16px_36px_rgba(0,0,0,0.04)] rounded-3xl mb-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#FFB800] to-[#FFE072] flex items-center justify-center font-display text-3xl font-extrabold text-[#111827] shadow-sm overflow-hidden shrink-0 border-2 border-white">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
                    {profile.username}
                  </h1>
                  {profile.openToWork && (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Available for Hire
                    </span>
                  )}
                </div>

                <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-lg mb-3 font-normal leading-relaxed">
                  {profile.bio || 'Software developer and collaborative builder on DevCollab.'}
                </p>

                {/* Gamification Level and Streak pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" /> Level {profile.level || 1}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    ⭐ {profile.xp || 0} XP
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 inline-flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#EA384C] fill-[#EA384C]" /> {profile.streak || 0} Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            {isSelf && (
              <div className="self-end md:self-auto">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-pill-red text-xs py-2.5 px-6 font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(234,56,76,0.25)] cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Edit Form Modal / Accordion */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-display font-extrabold text-lg text-[#111827] mb-4">Edit Your Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    className="w-full text-xs py-2 px-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bio / Headline</label>
                  <textarea
                    rows={2}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full text-xs p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] text-[#111827] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, Next.js"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      className="w-full text-xs py-2 px-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tech Stack</label>
                    <input
                      type="text"
                      placeholder="TypeScript, Python, MongoDB"
                      value={editForm.techStack}
                      onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                      className="w-full text-xs py-2 px-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[#EA384C] text-[#111827]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editForm.openToWork}
                    onChange={(e) => setEditForm({ ...editForm, openToWork: e.target.checked })}
                    className="w-4 h-4 accent-[#EA384C] rounded"
                  />
                  <span className="text-xs font-bold text-gray-700">Mark as open to work / available for hire</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-pill-red px-6 py-2.5 text-xs font-bold shadow-[0_8px_20px_rgba(234,56,76,0.3)]"
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Skills & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column (4 cols): Skills & Badges */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.04)] rounded-3xl">
              <h3 className="font-display font-extrabold text-lg text-[#111827] mb-3">Skills & Technologies</h3>
              {allSkills.length === 0 ? (
                <p className="text-xs text-gray-400">No skills listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <span key={skill} className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100/90 text-gray-700 border border-gray-200/60">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="glass-card p-6 bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 shadow-sm rounded-3xl text-[#111827]">
              <h3 className="font-display font-extrabold text-lg mb-4 text-blue-950">Contribution Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-xs font-medium text-gray-500 block">Total Repos</span>
                  <span className="font-display font-extrabold text-2xl text-[#111827]">{repos.length}</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-xs font-medium text-gray-500 block">Activities</span>
                  <span className="font-display font-extrabold text-2xl text-[#111827]">{activities.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Contribution Graph & Projects */}
          <div className="lg:col-span-8 space-y-8">
            {/* Real Contribution Heatmap */}
            <div className="glass-card p-6 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.04)] rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-extrabold text-lg text-[#111827]">Annual Contributions</h3>
                <span className="text-xs font-bold text-gray-400">{selectedYear}</span>
              </div>
              <div className="overflow-x-auto">
                <ContributionGraph
                  activities={activities}
                  year={selectedYear}
                  availableYears={availableYears}
                  onYearSelect={setSelectedYear}
                />
              </div>
            </div>

            {/* User Projects List */}
            <div>
              <h3 className="font-display font-extrabold text-2xl text-[#111827] mb-4">Projects</h3>
              {repos.length === 0 ? (
                <EmptyState
                  icon={<FolderGit2 className="w-8 h-8 text-[#EA384C]" />}
                  title="No projects yet"
                  description="This developer has not created any repositories yet."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {repos.slice(0, 4).map((repo) => (
                    <ProjectCard key={repo._id} repo={repo} />
                  ))}
                </div>
              )}
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
      <React.Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
        <ProfileContent />
      </React.Suspense>
    </ProtectedRoute>
  );
}
 