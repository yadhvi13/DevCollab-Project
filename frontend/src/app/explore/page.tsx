"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Search, Filter, FolderGit2, Users, SlidersHorizontal, 
  Sparkles, Layers, Tag, X, Check 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProjectCard from '@/components/cards/ProjectCard';
import DeveloperCard from '@/components/cards/DeveloperCard';
import EmptyState from '@/components/ui/EmptyState';
import { Squiggle } from '@/components/ui/DecorativeShapes';
import { API_BASE_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';

const TECH_TAGS = ['All', 'TypeScript', 'JavaScript', 'Python', 'React', 'HTML/CSS', 'Go', 'Rust'];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'developers'>('projects');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('recent');

  const [repos, setRepos] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploreData();
  }, [token]);

  const fetchExploreData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public repositories
      const reposRes = await fetch(`${API_BASE_URL}/api/repos?type=public`);
      if (reposRes.ok) {
        const data = await reposRes.json();
        if (Array.isArray(data)) {
          setRepos(data);
        }
      }

      // 2. Fetch registered developers
      const devsRes = await fetch(`${API_BASE_URL}/api/users`);
      if (devsRes.ok) {
        const devsData = await devsRes.json();
        if (Array.isArray(devsData)) {
          setDevelopers(devsData);
        }
      }
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Projects by Search & Tech Tag
  const filteredProjects = useMemo(() => {
    return repos.filter((r) => {
      const matchesSearch =
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedTag === 'All') return matchesSearch;

      const tagLower = selectedTag.toLowerCase();
      const hasFileMatch = r.files?.some((f: any) =>
        f.path?.toLowerCase().includes(tagLower)
      );
      return matchesSearch && hasFileMatch;
    });
  }, [repos, searchQuery, selectedTag]);

  // Filter Developers by Search
  const filteredDevelopers = useMemo(() => {
    return developers.filter((d) => {
      const query = searchQuery.toLowerCase();
      const matchesName = d.username?.toLowerCase().includes(query);
      const matchesBio = d.bio?.toLowerCase().includes(query);
      const matchesSkills =
        d.skills?.some((s: string) => s.toLowerCase().includes(query)) ||
        d.techStack?.some((s: string) => s.toLowerCase().includes(query));

      if (selectedTag === 'All') return matchesName || matchesBio || matchesSkills;

      const tagLower = selectedTag.toLowerCase();
      const hasSkill =
        d.skills?.some((s: string) => s.toLowerCase().includes(tagLower)) ||
        d.techStack?.some((s: string) => s.toLowerCase().includes(tagLower));

      return (matchesName || matchesBio || matchesSkills) && hasSkill;
    });
  }, [developers, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        
        {/* Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-[#EA384C] text-xs font-bold border border-red-100 mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Directory & Ecosystem</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#111827] tracking-tight">
            Discover What's <span className="text-[#EA384C]">Being Built</span>
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1.5 max-w-lg">
            Search real open-source repositories and connect with passionate software engineers building together.
          </p>
        </div>

        {/* View Toggle & Search Bar */}
        <div className="glass-card p-4 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.04)] rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Animated Pill Tab Switcher */}
          <div className="flex items-center p-1 rounded-full bg-gray-100/80 border border-gray-200/60 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#111827]'
              }`}
            >
              <FolderGit2 className="w-4 h-4" /> Projects ({filteredProjects.length})
            </button>

            <button
              onClick={() => setActiveTab('developers')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'developers'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#111827]'
              }`}
            >
              <Users className="w-4 h-4" /> Developers ({filteredDevelopers.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'projects' ? "Filter repositories by name or author..." : "Filter developers by skill or username..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2.5 pl-10 pr-8 bg-gray-50 border border-gray-200/80 rounded-full focus:outline-none focus:border-[#EA384C] focus:bg-white focus:ring-2 focus:ring-[#EA384C]/15 transition-all text-[#111827]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Layout: Sidebar Filters + Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Filter Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="glass-card p-5 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.04)] rounded-3xl">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm text-[#111827] border-b border-gray-100 pb-3 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-[#EA384C]" /> Filter by Tech Stack
              </div>

              <div className="flex flex-wrap gap-2">
                {TECH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-[#FFB800] text-[#111827] shadow-sm scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-[#111827]'
                    }`}
                  >
                    {selectedTag === tag && <Check className="w-3 h-3 inline-block mr-1" />}
                    {tag}
                  </button>
                ))}
              </div>

              {selectedTag !== 'All' && (
                <button
                  onClick={() => setSelectedTag('All')}
                  className="text-xs font-bold text-[#EA384C] hover:underline mt-4 block"
                >
                  Clear Tag Filter
                </button>
              )}
            </div>

            {/* Hint Box */}
            <div className="glass-card p-5 bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 shadow-sm rounded-3xl text-[#111827]">
              <h4 className="font-display font-extrabold text-sm mb-1 text-blue-900">Open Source Platform</h4>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                All projects are backed by real MongoDB database records and support live real-time commits.
              </p>
            </div>
          </aside>

          {/* Right Main Grid (9 cols) */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-6 h-64 animate-pulse bg-white/60 rounded-3xl" />
                ))}
              </div>
            ) : activeTab === 'projects' ? (
              /* Projects Grid */
              filteredProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderGit2 className="w-8 h-8 text-[#EA384C]" />}
                  title="No projects found"
                  description={
                    searchQuery || selectedTag !== 'All'
                      ? "No repositories match your active search filters. Try clearing your query or exploring other categories."
                      : "No public repositories exist yet. Be the first developer to create a public project!"
                  }
                  actionText={searchQuery || selectedTag !== 'All' ? "Reset Filters" : "Create Project"}
                  onAction={() => {
                    if (searchQuery || selectedTag !== 'All') {
                      setSearchQuery('');
                      setSelectedTag('All');
                    } else {
                      window.location.href = user ? "/dashboard" : "/auth";
                    }
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((repo) => (
                    <ProjectCard key={repo._id} repo={repo} />
                  ))}
                </div>
              )
            ) : (
              /* Developers Grid */
              filteredDevelopers.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-8 h-8 text-[#3B82F6]" />}
                  title="No developers found"
                  description="No registered developers match your search query."
                  actionText="Reset Search"
                  onAction={() => {
                    setSearchQuery('');
                    setSelectedTag('All');
                  }}
                  accentColor="#3B82F6"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDevelopers.map((dev) => (
                    <DeveloperCard key={dev._id || dev.username} user={dev} />
                  ))}
                </div>
              )
            )}
          </div>

        </div>

      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <ExploreContent />
    </React.Suspense>
  );
}
