"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { 
  Terminal, Search, Bell, Plus, Menu, X, MessageSquare, 
  LogOut, User as UserIcon, Zap, CheckCircle2, ChevronDown 
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
  const pathname = usePathname();
  const router = useRouter();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Home', href: '/' },
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
      <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 bg-white/80 backdrop-blur-xl px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo (Image 2 style) */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-10 h-10 rounded-2xl bg-[#EA384C] flex items-center justify-center shadow-[0_8px_20px_rgba(234,56,76,0.35)] group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-2xl text-[#111827] tracking-tight">
                  Dev<span className="text-[#EA384C]">Collab</span>
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-100 text-[#111827] font-bold'
                        : 'text-gray-600 hover:text-[#111827] hover:bg-gray-50'
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
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects & devs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-10 pr-4 bg-gray-50 border border-gray-200/70 rounded-full focus:outline-none focus:border-[#EA384C] focus:bg-white focus:ring-2 focus:ring-[#EA384C]/15 transition-all"
            />
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            
            {/* Global Chat Lounge Trigger */}
            <button
              onClick={() => setShowChatDrawer(true)}
              className="relative p-2.5 rounded-full bg-gray-50 hover:bg-[#FFB800]/20 text-gray-700 hover:text-[#111827] border border-gray-200/60 transition-all cursor-pointer shadow-sm"
              title="Open Global Lounge"
            >
              <MessageSquare className="w-4 h-4" />
              {onlineUsers && onlineUsers.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Popover */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-[#111827] border border-gray-200/60 transition-all cursor-pointer shadow-sm"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl p-4 text-[#111827] z-50">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <span className="font-display font-bold text-sm">Notifications</span>
                  <span className="text-[10px] font-bold text-gray-400">Live</span>
                </div>
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                  <p className="font-display font-bold text-sm text-[#111827]">You're all caught up.</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Nothing needs your attention right now.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cute Cherry Red Pill Button (like "Sign Up" in Image 2) */}
            <button
              onClick={() => {
                if (user) {
                  setShowCreateModal(true);
                } else {
                  router.push('/auth');
                }
              }}
              className="btn-pill-red text-xs py-2 px-5 hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Project</span>
            </button>

            {/* Profile Dropdown or Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/70 transition-all cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-[#FFB800] flex items-center justify-center text-xs font-black text-[#111827] overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#111827] max-w-[90px] truncate hidden md:inline-block">
                      {user.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl p-2 text-[#111827] z-50">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="font-display font-bold text-sm leading-none">{user.username}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/feed')}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl hover:bg-gray-50"
                  >
                    Developer Feed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="cursor-pointer font-bold text-xs p-2.5 rounded-xl text-[#EA384C] hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth"
                className="btn-pill-glass text-xs py-2 px-5 font-bold"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-full bg-gray-50 text-gray-700"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-2 rounded-xl text-sm font-semibold ${
                  pathname === link.href ? 'bg-[#EA384C] text-white font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowCreateModal(true);
              }}
              className="w-full btn-pill-red py-2.5 text-xs font-bold mt-2"
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
