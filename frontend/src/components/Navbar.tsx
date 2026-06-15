"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  FolderGit2, Search, Bell, Plus, ChevronDown, Menu, X, Settings, LogOut, 
  User as UserIcon, Sun, Moon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-background/90 border-b border-border px-4 py-3 flex items-center justify-between z-50 sticky top-0 shrink-0 analytics-header backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_12px_var(--shadow-color)] mr-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-widest font-space-mono hidden sm:block">DEVCOLLAB</span>
        </Link>
        
        <div className="relative w-64 ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Quick search... (cmd + k)"
            className="w-full bg-input border border-border rounded-md py-1.5 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold font-space-mono tracking-wider ml-4">
          <Link href="/feed" className="cursor-pointer text-muted-foreground hover:text-foreground active:text-primary transition-colors">Social Feed</Link>
          <Link href="/chat" className="cursor-pointer text-muted-foreground hover:text-foreground active:text-primary transition-colors">Global Chat</Link>
          <a href="#" className="text-muted-foreground hover:text-foreground active:text-primary transition-colors">Marketplace</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground active:scale-90 transition-all cursor-pointer p-1 rounded-md hover:bg-muted"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="text-muted-foreground hover:text-foreground active:scale-90 transition-all relative cursor-pointer p-1 rounded-md hover:bg-muted">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        {/* Plus Action Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground active:text-primary transition-colors flex items-center gap-1 cursor-pointer focus:outline-none">
              <Plus className="w-5 h-5" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border text-foreground z-50">
            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">New Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/create')} className="cursor-pointer focus:bg-muted focus:text-foreground">
                Create Repository
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/import')} className="cursor-pointer focus:bg-muted focus:text-foreground">
                Import Repository
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/project/new')} className="cursor-pointer focus:bg-muted focus:text-foreground">
                New Project
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => router.push('/explore')} className="cursor-pointer focus:bg-muted focus:text-foreground text-center justify-center font-medium">
              Explore Repositories
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative shrink-0 cursor-pointer focus:outline-none">
              <button 
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white text-xs font-bold border border-border hover:border-muted-foreground transition-all shadow-[0_0_10px_var(--shadow-color)] cursor-pointer"
                title="Profile"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </button>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full z-10" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-card border-border text-foreground z-50">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-xs text-muted-foreground font-normal">Signed in as</span>
              <span className="text-sm font-bold text-foreground truncate">{user?.username}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer focus:bg-muted focus:text-foreground flex gap-2">
                <UserIcon className="w-4 h-4" /> Your Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/')} className="cursor-pointer focus:bg-muted focus:text-foreground flex gap-2">
                <FolderGit2 className="w-4 h-4" /> Your Repositories
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer focus:bg-muted focus:text-foreground flex gap-2">
                <Settings className="w-4 h-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer focus:bg-muted text-destructive focus:text-destructive focus:bg-muted flex gap-2">
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-2xl md:hidden z-50">
          <nav className="flex flex-col text-sm font-semibold p-2">
            <button 
              onClick={() => { setShowMobileMenu(false); router.push('/feed'); }} 
              className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-muted active:bg-primary/20 active:text-primary rounded-md transition-colors cursor-pointer"
            >
              Social Feed
            </button>
            <button 
              onClick={() => { setShowMobileMenu(false); router.push('/chat'); }} 
              className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-muted active:bg-primary/20 active:text-primary rounded-md transition-colors cursor-pointer"
            >
              Global Chat
            </button>
            <button 
              className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-muted active:bg-primary/20 active:text-primary rounded-md transition-colors cursor-pointer"
            >
              Marketplace
            </button>
            
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-1">
              <span className="text-sm font-semibold text-muted-foreground">Theme</span>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" /> Dark Mode
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
