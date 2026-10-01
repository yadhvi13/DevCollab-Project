"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Search, Bell, Plus, Menu, X, MessageSquare, 
  LogOut, User as UserIcon, CheckCircle2, ChevronDown,
  Sun, Moon, Tv
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import ChatDrawer from '@/components/chat/ChatDrawer';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Full App', href: '/app' },
    { label: 'Explore', href: '/explore' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Feed', href: '/feed' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E2E0DB] dark:border-zinc-800 bg-[#F4F2EF]/95 dark:bg-[#090909]/95 backdrop-blur-xl px-4 md:px-8 py-3 transition-colors text-[#1C1917] dark:text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-[#B7194B] flex items-center justify-center shadow-[0_6px_18px_rgba(183,25,75,0.35)] group-hover:scale-105 transition-transform">
                <span className="font-display font-black text-sm text-white">DC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl text-[#1C1917] dark:text-white tracking-tight leading-none">
                  DEV <span className="text-[#B7194B]">COLLAB</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  Workspace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-stone-200/80 dark:bg-zinc-800 text-[#1C1917] dark:text-white font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-[#1C1917] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects & devs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-4 bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 rounded-full focus:outline-none focus:border-[#B7194B] focus:ring-2 focus:ring-[#B7194B]/15 transition-all text-[#1C1917] dark:text-white placeholder:text-zinc-400"
            />
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Dark / Light Theme Toggle Switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-[#1C1917] dark:text-zinc-200 border border-[#E2E0DB] dark:border-zinc-800 transition-all cursor-pointer shadow-xs flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#1C1917] transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Back to Showcase Presentation Link */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 border border-[#E2E0DB] dark:border-zinc-800 hover:border-[#B7194B] transition-colors"
              title="Return to Presentation Showcase"
            >
              <Tv className="w-3.5 h-3.5 text-[#B7194B]" />
              <span>Showcase</span>
            </Link>

            {/* Global Chat Lounge Trigger */}
            <button
              onClick={() => setShowChatDrawer(true)}
              className="relative p-2 rounded-full bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-[#E2E0DB] dark:border-zinc-800 transition-all cursor-pointer shadow-xs"
              title="Open Global Lounge"
            >
              <MessageSquare className="w-4 h-4" />
              {onlineUsers && onlineUsers.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {/* Notifications Popover */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-[#E2E0DB] dark:border-zinc-800 transition-all cursor-pointer shadow-xs"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 rounded-2xl shadow-xl p-4 text-[#1C1917] dark:text-white z-50">
                <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-zinc-800 pb-2 mb-3">
                  <span className="font-display font-bold text-xs uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] font-bold text-emerald-500">Live</span>
                </div>
                <div className="py-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  <p className="font-display font-bold text-xs">You're all caught up.</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">No pending repository alerts.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Project Button */}
            <button
              onClick={() => {
                if (user) {
                  setShowCreateModal(true);
                } else {
                  router.push('/auth');
                }
              }}
              className="px-4 py-1.5 rounded-full bg-[#B7194B] hover:bg-[#c92055] text-white text-xs font-bold transition-all duration-180 hover:scale-[1.02] active:scale-[0.98] shadow-sm hidden sm:inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Project</span>
            </button>

            {/* Profile Dropdown or Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 transition-all cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-[#B7194B] flex items-center justify-center text-[10px] font-black text-white overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#1C1917] dark:text-white max-w-[80px] truncate hidden md:inline-block">
                      {user.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-900 border border-[#E2E0DB] dark:border-zinc-800 rounded-2xl shadow-xl p-2 text-[#1C1917] dark:text-white z-50">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="font-display font-bold text-sm leading-none">{user.username}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-stone-200 dark:bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                  >
                    Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/feed')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                  >
                    Developer Feed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-stone-200 dark:bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl text-[#B7194B] hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-1.5 rounded-full bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 dark:hover:bg-zinc-700 text-[#1C1917] dark:text-white text-xs font-bold transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-full bg-white dark:bg-zinc-900 text-[#1C1917] dark:text-white border border-[#E2E0DB] dark:border-zinc-800"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="md:hidden pt-4 pb-2 border-t border-[#E2E0DB] dark:border-zinc-800 mt-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-2 rounded-xl text-xs font-semibold ${
                  pathname === link.href
                    ? 'bg-[#B7194B] text-white font-bold'
                    : 'text-[#1C1917] dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 rounded-xl text-xs font-semibold text-[#B7194B] hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              ◀ View Showcase Presentation
            </Link>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowCreateModal(true);
              }}
              className="w-full py-2.5 rounded-full bg-[#B7194B] text-white text-xs font-bold mt-2"
            >
              + Create Project
            </button>
          </div>
        )}
      </header>

      {/* Global Modals & Drawers */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
      />
    </>
  );
}
